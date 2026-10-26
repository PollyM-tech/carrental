from datetime import timedelta, time
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
import time as clock

from PIL import Image
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core import signing
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import DatabaseError, IntegrityError, connection, transaction
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from apps.rentals.models import Booking, Car
from .auth import totp
from .models import AuditEvent, BookingHistory, CustomerProfile, KycCase, KycDecision, PhoneChallenge, Policy, PrivateDocument, StaffAuthenticator, VehicleDocument, VehicleBlock
from .security import cipher, decrypt, encrypt, fingerprint
from .services import transition, vehicle_available, staffed_due, expire_holds

FAST_PASSWORDS = ["django.contrib.auth.hashers.MD5PasswordHasher"]


@override_settings(PASSWORD_HASHERS=FAST_PASSWORDS)
class WorkflowTests(APITestCase):
    def setUp(self):
        User = get_user_model()
        self.customer = User.objects.create_user(email="customer@test.com", password="testpassword", phone="+254700000001")
        self.other = User.objects.create_user(email="other@test.com", password="testpassword")
        self.owner = User.objects.create_superuser(email="owner@test.com", password="testpassword")
        self.reviewer = User.objects.create_user(email="reviewer@test.com", password="testpassword", is_staff=True)
        self.reviewer.groups.add(Group.objects.get_or_create(name="kyc_reviewer")[0])
        self.fleet = User.objects.create_user(email="fleet@test.com", password="testpassword", is_staff=True)
        self.fleet.groups.add(Group.objects.get_or_create(name="fleet_manager")[0])
        self.start = timezone.localdate()+timedelta(days=10)
        self.end = self.start+timedelta(days=3)
        self.car = Car.objects.create(name="Movara test SUV", category="SUV", pricePerDay=5000, seats=5, transmission="Automatic", fuel="Petrol", plateNumber="TEST001", mileage=12345)
        for kind in ["insurance", "inspection"]:
            VehicleDocument.objects.create(car=self.car, kind=kind, reference="test", expires_on=self.end+timedelta(days=30))
        Policy.objects.all().delete()
        self.policy = Policy.objects.create(minimum_age=25, minimum_licence_months=24, staffed_start=time(9), staffed_end=time(17), staffed_weekdays=[0,1,2,3,4], privacy_notice_version="test-v1", privacy_notice_text="Test-only approved notice", retention_days=90, category_rules={"SUV": {"guarantor_required": False}})
        self.details = {"full_name": "Test Customer", "id_number": "12345678", "date_of_birth": "1990-01-01", "licence_number": "DL123456", "licence_class": "B", "licence_issued": "2010-01-01", "licence_expiry": (self.end+timedelta(days=30)).isoformat(), "address": "Test address", "next_of_kin_name": "Test Kin", "next_of_kin_phone": "+254700000002", "destination": "Nairobi", "cross_border": False, "guarantor_name": "Test Guarantor", "guarantor_phone": "+254700000003"}
        self.profile = CustomerProfile.objects.create(user=self.customer, details_encrypted=encrypt(self.details), id_hash=fingerprint(self.details["id_number"]), licence_hash=fingerprint(self.details["licence_number"]), phone_verified_at=timezone.now(), verified_phone_hash=fingerprint(self.customer.phone))
        self.client.force_authenticate(self.customer)
        self.base = "/api/v1/workflow/"

    def booking(self, customer=None):
        return Booking.objects.create(customer=customer or self.customer, car=self.car, carName=self.car.name, customerName="Test", pickupDate=self.start, returnDate=self.end, totalAmount=15000, totalDays=3)

    def complete_documents(self, booking):
        for kind in ["id_front", "id_back", "licence_front", "licence_back"]:
            PrivateDocument.objects.create(booking=booking, owner=self.customer, kind=kind, storage_name="test.enc", content_type="image/jpeg", checksum="test", size=100)

    def submitted(self):
        booking = self.booking()
        self.complete_documents(booking)
        response = self.client.post(self.base+f"bookings/{booking.pk}/submit/", {"consent": True, "consent_version": "test-v1"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        return booking, KycCase.objects.get(booking=booking)

    def start_review(self, case):
        self.client.force_authenticate(self.reviewer)
        response = self.client.post(self.base+f"reviews/{case.pk}/", {"decision": "start"}, format="json")
        self.assertEqual(response.status_code, 200, response.data)

    def approve(self, case):
        return self.client.post(self.base+f"reviews/{case.pk}/", {"decision": "approve", "checks": {"details_match": True, "documents_genuine": True, "ntsa_checked": True, "correct_class": True}}, format="json")

    def test_public_catalogue_omits_internal_registration(self):
        response = self.client.get(self.base+"public/cars/")
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("plateNumber", response.data[0])
        self.assertNotIn("imageStorageId", response.data[0])

    def test_draft_booking_recomputes_price_and_has_history(self):
        response = self.client.post(self.base+"bookings/", {"carId": str(self.car.pk), "pickupDate": str(self.start), "returnDate": str(self.end), "totalAmount": 1}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(response.data["totalAmount"], 15000)
        self.assertEqual(response.data["status"], "draft")
        self.assertEqual(BookingHistory.objects.get().current, "draft")

    def test_invalid_dates_and_missing_compliance_block_booking(self):
        self.car.documents.all().delete()
        response = self.client.post(self.base+"bookings/", {"carId": str(self.car.pk), "pickupDate": str(self.start), "returnDate": str(self.end)}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.get(self.base+f"public/cars/?pickupDate={self.start}&returnDate={self.end}").data, [])
        self.assertEqual(self.client.get(self.base+"public/cars/?pickupDate=bad&returnDate=bad").status_code, 400)

    def test_date_availability_ignores_manual_booked_flag_and_handles_boundaries(self):
        self.car.status = "booked"; self.car.save()
        self.assertTrue(vehicle_available(self.car, self.start, self.end))
        Booking.objects.create(car=self.car, customer=self.customer, customerName="Test", status="confirmed", pickupDate=self.start, returnDate=self.end)
        self.assertFalse(vehicle_available(self.car, self.start, self.end))
        self.assertTrue(vehicle_available(self.car, self.end, self.end+timedelta(days=2)))

    def test_vehicle_service_block(self):
        VehicleBlock.objects.create(car=self.car, starts_on=self.start, ends_on=self.end, reason="Service")
        self.assertFalse(vehicle_available(self.car, self.start, self.end))
        self.assertTrue(vehicle_available(self.car, self.end, self.end+timedelta(days=2)))

    def test_customer_cannot_read_another_booking_or_review_queue(self):
        booking = self.booking(self.other)
        self.assertEqual(self.client.get(self.base+f"bookings/{booking.pk}/").status_code, 404)
        self.assertEqual(self.client.get(self.base+"reviews/").status_code, 403)

    def test_roles_separate_review_from_fleet_changes(self):
        self.client.force_authenticate(self.reviewer)
        self.assertEqual(self.client.post("/api/v1/rentals/cars/update/", {"id": str(self.car.pk), "name": "Changed"}).status_code, 403)
        self.client.force_authenticate(self.fleet)
        self.assertEqual(self.client.get(self.base+"reviews/").status_code, 403)
        self.assertEqual(self.client.get(self.base+f"fleet/{self.car.pk}/").status_code, 200)

    def test_encrypted_profile_and_duplicate_detection(self):
        self.assertNotIn("12345678", self.profile.details_encrypted)
        self.assertEqual(decrypt(self.profile.details_encrypted)["id_number"], "12345678")
        CustomerProfile.objects.create(user=self.other, id_hash=self.profile.id_hash)
        booking = self.booking(); self.complete_documents(booking)
        response = self.client.post(self.base+f"bookings/{booking.pk}/submit/", {"consent": True, "consent_version": "test-v1"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_kyc_requires_current_consent_and_all_documents(self):
        booking = self.booking()
        url = self.base+f"bookings/{booking.pk}/submit/"
        self.assertEqual(self.client.post(url, {"consent": False}, format="json").status_code, 400)
        self.assertEqual(self.client.post(url, {"consent": True, "consent_version": "test-v1"}, format="json").status_code, 400)

    def test_review_approval_creates_hold_with_all_statuses(self):
        booking, case = self.submitted(); self.start_review(case)
        response = self.approve(case)
        self.assertEqual(response.status_code, 200, response.data)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "awaiting_payment")
        self.assertGreater(booking.hold_expires_at, timezone.now())
        self.assertEqual(list(booking.history.values_list("current", flat=True)), ["kyc_submitted", "kyc_in_review", "kyc_approved", "awaiting_payment"])
        self.assertEqual(KycDecision.objects.get().decision, "approve")

    def test_approval_requires_policy_and_manual_checks(self):
        booking, case = self.submitted(); self.start_review(case)
        response = self.client.post(self.base+f"reviews/{case.pk}/", {"decision": "approve"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.policy.minimum_age = None; self.policy.save()
        self.assertEqual(self.approve(case).status_code, 400)
        booking.refresh_from_db(); self.assertEqual(booking.status, "kyc_in_review")

    def test_all_categories_require_guarantor_even_without_category_rule(self):
        _, case = self.submitted(); self.start_review(case)
        self.policy.category_rules = {}; self.policy.save()
        details = dict(self.details, guarantor_name="", guarantor_phone="")
        case.details_encrypted = encrypt(details); case.save()
        self.assertEqual(self.approve(case).status_code, 400)

    def test_correction_preserves_due_time(self):
        booking, case = self.submitted(); self.start_review(case)
        due = case.due_at
        response = self.client.post(self.base+f"reviews/{case.pk}/", {"decision": "correction", "reason": "Retake licence back"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.client.force_authenticate(self.customer)
        response = self.client.post(self.base+f"bookings/{booking.pk}/submit/", {"consent": True, "consent_version": "test-v1"}, format="json")
        self.assertEqual(response.status_code, 200)
        case.refresh_from_db(); self.assertEqual(case.due_at, due)

    def test_second_approval_cannot_take_same_vehicle_dates(self):
        booking1, case1 = self.submitted()
        self.client.force_authenticate(self.customer)
        booking2, case2 = self.submitted()
        self.start_review(case1); self.assertEqual(self.approve(case1).status_code, 200)
        self.start_review(case2); self.assertEqual(self.approve(case2).status_code, 400)

    def test_expired_hold_is_released_and_logged(self):
        booking, case = self.submitted(); self.start_review(case); self.approve(case)
        Booking.objects.filter(pk=booking.pk).update(hold_expires_at=timezone.now()-timedelta(seconds=1))
        expire_holds(); booking.refresh_from_db()
        self.assertEqual(booking.status, "expired")
        self.assertTrue(vehicle_available(self.car, self.start, self.end))

    @override_settings(OTP_BACKEND="whatsapp")
    @patch("apps.workflow.views.send_code")
    def test_whatsapp_verification_is_one_time_and_not_exposed(self, send):
        response = self.client.post(self.base+"phone/request/", {"phone": "0700000001"})
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("development_code", response.data)
        code = send.call_args.args[1]
        response = self.client.post(self.base+"phone/verify/", {"code": code})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.post(self.base+"phone/verify/", {"code": code}).status_code, 400)
        challenge = PhoneChallenge.objects.get()
        self.assertNotEqual(challenge.code_hash, code)

    @override_settings(OTP_BACKEND="whatsapp", WHATSAPP_ACCESS_TOKEN="")
    def test_unconfigured_whatsapp_does_not_issue_challenge(self):
        response = self.client.post(self.base+"phone/request/", {"phone": "0700000001"})
        self.assertEqual(response.status_code, 503)
        self.assertEqual(PhoneChallenge.objects.count(), 0)

    def test_staff_two_factor_enrollment_and_replay_rejection(self):
        self.client.force_authenticate(None)
        login = self.client.post("/api/v1/rentals/staff-login/", {"email": self.owner.email, "password": "testpassword"})
        self.assertEqual(login.status_code, 200)
        self.assertNotIn("token", login.data)
        self.assertTrue(login.data["enrollment_required"])
        code = totp(login.data["secret"], int(clock.time())//30)
        verified = self.client.post("/api/v1/rentals/staff-verify/", {"challenge": login.data["challenge"], "code": code})
        self.assertEqual(verified.status_code, 200, verified.data)
        self.assertTrue(StaffAuthenticator.objects.get(user=self.owner).enabled)
        self.assertEqual(self.client.post("/api/v1/rentals/staff-verify/", {"challenge": login.data["challenge"], "code": code}).status_code, 400)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer "+verified.data["token"])
        self.assertEqual(self.client.get(self.base+"access/").status_code, 200)

    def test_staff_cannot_bypass_two_factor_via_customer_login(self):
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post("/api/v1/auth/login/", {"email": self.owner.email, "password": "testpassword"}).status_code, 401)

    def test_illegal_transition_rejected(self):
        booking = self.booking()
        with self.assertRaises(Exception):
            transition(booking, "active", self.owner)
        booking.refresh_from_db(); self.assertEqual(booking.status, "draft")

    def test_staffed_timer_crosses_weekend_without_counting_closed_hours(self):
        from datetime import datetime
        from zoneinfo import ZoneInfo
        friday = datetime(2026, 10, 23, 16, 50, tzinfo=ZoneInfo("Africa/Nairobi"))
        self.assertEqual(staffed_due(friday).isoformat(), "2026-10-26T09:20:00+03:00")

    def test_postgres_overlap_constraint_even_for_direct_writes(self):
        if connection.vendor != "postgresql": self.skipTest("PostgreSQL-only database guard")
        Booking.objects.create(car=self.car, customerName="First", status="confirmed", pickupDate=self.start, returnDate=self.end)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Booking.objects.create(car=self.car, customerName="Second", status="confirmed", pickupDate=self.start, returnDate=self.end)

    def test_postgres_audit_is_immutable_even_for_queryset_writes(self):
        if connection.vendor != "postgresql": self.skipTest("PostgreSQL-only database guard")
        event = AuditEvent.objects.create(actor=self.owner, action="test", entity="test", entity_id="1")
        with self.assertRaises(DatabaseError), transaction.atomic():
            AuditEvent.objects.filter(pk=event.pk).update(reason="tamper")

    def test_private_upload_is_encrypted_and_owner_scoped(self):
        booking = self.booking()
        raw = BytesIO(); Image.effect_noise((800,600), 70).convert("RGB").save(raw, "JPEG")
        with TemporaryDirectory() as root, override_settings(PRIVATE_DOCUMENT_ROOT=root):
            response = self.client.post(self.base+f"bookings/{booking.pk}/documents/", {"consent": "true", "consent_version": "test-v1", "kind": "id_front", "image": SimpleUploadedFile("id.jpg", raw.getvalue(), content_type="image/jpeg")}, format="multipart")
            self.assertEqual(response.status_code, 201, response.data)
            doc = PrivateDocument.objects.get(pk=response.data["id"])
            encrypted = (Path(root)/doc.storage_name).read_bytes()
            self.assertFalse(encrypted.startswith(b"\xff\xd8"))
            self.assertTrue(cipher().decrypt(encrypted).startswith(b"\xff\xd8"))
            url = self.base+f"documents/{doc.pk}/link/"
            result = self.client.post(url)
            self.assertEqual(result.status_code, 200)
            content = self.client.get(result.data["url"])
            self.assertEqual(content.status_code, 200)
            self.assertIn("no-store", content["Cache-Control"])
            self.client.force_authenticate(self.other)
            self.assertEqual(self.client.post(url).status_code, 403)

    def test_blank_document_is_rejected(self):
        booking = self.booking(); raw = BytesIO(); Image.new("RGB", (800,600), "white").save(raw,"JPEG")
        response = self.client.post(self.base+f"bookings/{booking.pk}/documents/", {"consent": "true", "consent_version": "test-v1", "kind": "id_front", "image": SimpleUploadedFile("id.jpg", raw.getvalue(), content_type="image/jpeg")}, format="multipart")
        self.assertEqual(response.status_code, 400)

    def test_contacts_are_encrypted_in_database_and_email_lookup_still_works(self):
        with connection.cursor() as cursor:
            cursor.execute("SELECT email, phone FROM accounts_user WHERE id=%s", [get_user_model()._meta.pk.get_db_prep_value(self.customer.pk, connection)])
            email, phone = cursor.fetchone()
        self.assertNotIn("customer@test.com", email)
        self.assertNotIn("+254700000001", phone)
        self.assertEqual(get_user_model().objects.get(email="CUSTOMER@test.com").pk, self.customer.pk)
        self.customer.refresh_from_db()
        self.assertEqual(self.customer.phone, "+254700000001")

    def test_totp_matches_rfc_vector(self):
        import base64
        self.assertEqual(totp(base64.b32encode(b"12345678901234567890").decode(), 1), "287082")

    def test_front_desk_can_create_customer_draft_but_reviewer_cannot(self):
        payload = {"customer_email": self.customer.email, "carId": str(self.car.pk), "pickupDate": str(self.start), "returnDate": str(self.end)}
        self.client.force_authenticate(self.reviewer)
        self.assertEqual(self.client.post(self.base+"bookings/", payload).status_code, 403)
        self.fleet.groups.add(Group.objects.get_or_create(name="front_desk")[0])
        self.client.force_authenticate(self.fleet)
        response = self.client.post(self.base+"bookings/", payload)
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Booking.objects.get(pk=response.data["_id"]).customer_id, self.customer.pk)

    def test_changed_profile_blocks_approval_until_correction(self):
        _, case = self.submitted(); self.start_review(case)
        changed = {**self.details, "address": "New address"}
        self.profile.details_encrypted = encrypt(changed); self.profile.save()
        self.assertEqual(self.approve(case).status_code, 400)

    def test_returning_customer_can_reuse_current_approved_documents(self):
        booking, case = self.submitted(); self.start_review(case)
        self.assertEqual(self.approve(case).status_code, 200)
        self.client.force_authenticate(self.customer)
        second = self.booking()
        with TemporaryDirectory() as root, override_settings(PRIVATE_DOCUMENT_ROOT=root):
            (Path(root)/"test.enc").write_bytes(cipher().encrypt(b"example"))
            response = self.client.post(self.base+f"bookings/{second.pk}/reuse-documents/")
            self.assertEqual(response.status_code, 200, response.data)
            self.assertEqual(PrivateDocument.objects.filter(booking=second).count(), 4)
            second.refresh_from_db(); self.assertEqual(second.status, "draft")

    def test_private_document_link_expiration_and_role_revocation(self):
        booking = self.booking(); self.complete_documents(booking)
        document = PrivateDocument.objects.filter(booking=booking).first()
        self.client.force_authenticate(self.reviewer)
        link = self.client.post(self.base+f"documents/{document.pk}/link/").data["url"]
        with patch("django.core.signing.time.time", return_value=clock.time()+61):
            self.assertEqual(self.client.get(link).status_code, 403)
        self.reviewer.groups.clear()
        self.assertEqual(self.client.get(link).status_code, 403)

    def test_reviewer_cannot_decide_another_reviewers_case(self):
        _, case = self.submitted(); self.start_review(case)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.approve(case).status_code, 400)

    def test_profile_endpoint_round_trip_with_optional_details(self):
        response = self.client.post(self.base+"profile/", self.details, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data["details"]["full_name"], "Test Customer")

    def test_scheduled_alerts_are_once_only_and_track_missed_review(self):
        from datetime import datetime
        from io import StringIO
        from zoneinfo import ZoneInfo
        from django.core.management import call_command
        from .models import Notification
        start = datetime(2026, 10, 20, 10, 0, tzinfo=ZoneInfo("Africa/Nairobi"))
        booking = self.booking()
        case = KycCase.objects.create(booking=booking, customer=self.customer, details_encrypted=encrypt(self.details), consent_version="test-v1", consent_at=start, submitted_at=start, due_at=staffed_due(start))
        with patch("django.utils.timezone.now", return_value=start+timedelta(minutes=26)):
            call_command("process_workflow", stdout=StringIO())
            first_count = Notification.objects.count()
            self.assertGreater(first_count, 0)
            call_command("process_workflow", stdout=StringIO())
            self.assertEqual(Notification.objects.count(), first_count)
        case.refresh_from_db()
        self.assertTrue(case.alerted_15)
        self.assertTrue(case.alerted_25)
        self.assertFalse(case.missed)
        with patch("django.utils.timezone.now", return_value=start+timedelta(minutes=31)):
            call_command("process_workflow", stdout=StringIO())
        case.refresh_from_db(); self.assertTrue(case.missed)
