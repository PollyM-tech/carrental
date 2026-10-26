from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from .tests import WorkflowTests, FAST_PASSWORDS
from .models import CustomerProfile, DataHold, DataRequest, DocumentErasure, KycCase, PhoneChallenge, PrivateDocument
from .privacy import erase_operational, run_retention
from .security import cipher, decrypt, encrypt


@override_settings(PASSWORD_HASHERS=FAST_PASSWORDS, OTP_BACKEND="manual_whatsapp")
class PrivacyAndPhoneTests(APITestCase):
    def setUp(self):
        WorkflowTests.setUp(self)
        cache.clear()
        self.policy.retention_days = 7; self.policy.save()
        self.storage = TemporaryDirectory()
        self.addCleanup(self.storage.cleanup)
        self.override = override_settings(PRIVATE_DOCUMENT_ROOT=self.storage.name)
        self.override.enable(); self.addCleanup(self.override.disable)

    def document(self, booking):
        doc = PrivateDocument.objects.create(booking=booking, owner=self.customer, kind="id_front", storage_name="identity.enc", content_type="image/jpeg", checksum="test", size=5)
        (Path(self.storage.name)/doc.storage_name).write_bytes(cipher().encrypt(b"photo"))
        return doc

    def old_data(self, status="closed"):
        old = timezone.now()-timedelta(days=8)
        with patch("django.utils.timezone.now", return_value=old):
            booking = WorkflowTests.booking(self)
            booking.status = status; booking.save()
            doc = self.document(booking)
            KycCase.objects.create(booking=booking, customer=self.customer, details_encrypted=encrypt(self.details), submitted_at=old, consent_at=old, consent_version="v1", status="approved")
        CustomerProfile.objects.filter(user=self.customer).update(updated_at=old)
        return booking, doc

    def manual(self, phone="0716741039"):
        response = self.client.post(self.base+"phone/request/", {"phone": phone})
        self.assertEqual(response.status_code, 200, response.data)
        return response.data

    def test_manual_request_uses_business_number_without_api(self):
        with patch("apps.workflow.views.send_code") as send:
            result = self.manual()
            send.assert_not_called()
        self.assertIn("https://wa.me/254716741039?", result["whatsapp_url"])
        self.assertEqual(len(result["reference"]), 12)
        self.assertNotEqual(PhoneChallenge.objects.get().code_hash, result["reference"])
        self.profile.refresh_from_db(); self.assertIsNone(self.profile.phone_verified_at)

    def test_customer_cannot_self_verify_manual_reference(self):
        result = self.manual()
        self.assertEqual(self.client.post(self.base+"phone/verify/", {"code": result["reference"]}).status_code, 400)
        self.assertEqual(self.client.post(self.base+"phone/manual/", {"id": PhoneChallenge.objects.get().pk, "reference": result["reference"], "checked_sender": True}).status_code, 403)

    def test_staff_sender_check_and_single_use(self):
        result = self.manual(); obj = PhoneChallenge.objects.get()
        self.client.force_authenticate(self.reviewer)
        data = {"id": obj.pk, "reference": result["reference"], "checked_sender": False}
        self.assertEqual(self.client.post(self.base+"phone/manual/", data).status_code, 400)
        data["checked_sender"] = True
        self.assertEqual(self.client.post(self.base+"phone/manual/", data).status_code, 200)
        self.profile.refresh_from_db(); self.assertIsNotNone(self.profile.phone_verified_at)
        self.assertEqual(self.client.post(self.base+"phone/manual/", data).status_code, 400)

    def test_manual_expiry_and_replaced_phone(self):
        result = self.manual(); first = PhoneChallenge.objects.get()
        self.manual("0716741040")
        self.client.force_authenticate(self.reviewer)
        data = {"id": first.pk, "reference": result["reference"], "checked_sender": True}
        self.assertEqual(self.client.post(self.base+"phone/manual/", data).status_code, 400)
        latest = PhoneChallenge.objects.order_by("-created_at").first()
        PhoneChallenge.objects.filter(pk=latest.pk).update(expires_at=timezone.now()-timedelta(seconds=1))
        data["id"] = latest.pk
        self.assertEqual(self.client.post(self.base+"phone/manual/", data).status_code, 400)

    def test_wrong_references_lock_after_five_attempts(self):
        self.manual(); obj = PhoneChallenge.objects.get()
        self.client.force_authenticate(self.reviewer)
        for _ in range(5):
            self.assertEqual(self.client.post(self.base+"phone/manual/", {"id": obj.pk, "reference": "FFFFFFFFFFFF", "checked_sender": True}).status_code, 400)
        obj.refresh_from_db(); self.assertTrue(obj.consumed)

    def test_customer_export_is_private_and_scoped(self):
        response = self.client.get(self.base+"privacy/export/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Cache-Control"], "private, no-store")
        self.assertEqual(response.data["account"]["email"], self.customer.email)
        self.assertNotIn("password", str(response.data["account"]))
        self.assertNotIn(self.other.email, str(response.data))
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(self.base+"privacy/export/").status_code, 401)

    def test_requests_are_scoped_encrypted_and_owner_only(self):
        response = self.client.post(self.base+"privacy/requests/", {"kind": "correction", "details": "Please correct my address"})
        self.assertEqual(response.status_code, 201)
        row = DataRequest.objects.get()
        self.assertNotIn("address", row.details_encrypted)
        self.assertEqual(decrypt(row.details_encrypted), "Please correct my address")
        self.assertEqual(self.client.get(self.base+"privacy/review/").status_code, 403)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(self.base+"privacy/requests/").data, [])
        self.client.force_authenticate(self.reviewer)
        self.assertEqual(self.client.get(self.base+"privacy/review/").status_code, 403)

    def test_retention_erases_files_snapshots_and_revokes_links(self):
        booking, doc = self.old_data()
        link = self.client.post(self.base+f"documents/{doc.pk}/link/").data["url"]
        result = run_retention()
        self.assertEqual(result["erased"], 1)
        self.assertFalse((Path(self.storage.name)/doc.storage_name).exists())
        self.assertTrue(DocumentErasure.objects.filter(document=doc).exists())
        self.profile.refresh_from_db(); self.assertEqual(self.profile.details_encrypted, "")
        self.assertEqual(KycCase.objects.get().details_encrypted, "")
        self.assertEqual(self.client.get(link).status_code, 404)
        self.assertEqual(run_retention()["erased"], 0)

    def test_retention_dry_run_keeps_files_and_data(self):
        _, doc = self.old_data()
        result = run_retention(dry_run=True)
        self.assertEqual(result["eligible"], 1)
        self.assertTrue((Path(self.storage.name)/doc.storage_name).exists())
        self.assertFalse(DocumentErasure.objects.exists())

    def test_open_rental_prevents_retention(self):
        _, doc = self.old_data("active")
        self.assertEqual(run_retention()["held"], 1)
        self.assertTrue((Path(self.storage.name)/doc.storage_name).exists())

    def test_recent_activity_prevents_retention(self):
        self.old_data()
        self.profile.save()
        self.assertEqual(run_retention()["erased"], 0)
        self.assertFalse(DocumentErasure.objects.exists())

    def test_policy_and_hold_prevent_retention(self):
        self.old_data()
        DataHold.objects.create(customer=self.customer, actor=self.owner, reason_encrypted=encrypt("Unresolved dispute"))
        self.assertEqual(run_retention()["held"], 1)
        DataHold.objects.all().delete()
        self.policy.privacy_notice_text = ""; self.policy.save()
        self.assertFalse(run_retention()["enabled"])
        self.assertFalse(DocumentErasure.objects.exists())

    def test_pending_access_request_prevents_retention(self):
        self.old_data()
        DataRequest.objects.create(customer=self.customer, kind="access")
        self.assertEqual(run_retention()["held"], 1)
        self.assertFalse(DocumentErasure.objects.exists())

    def test_deletion_requires_password_then_owner_and_deactivates_account(self):
        _, doc = self.old_data()
        self.assertEqual(self.client.post(self.base+"privacy/requests/", {"kind": "deletion"}).status_code, 400)
        response = self.client.post(self.base+"privacy/requests/", {"kind": "deletion", "password": "testpassword"})
        self.assertEqual(response.status_code, 201)
        data = {"id": response.data["id"], "action": "complete", "resolution": "Reviewed request"}
        self.assertEqual(self.client.post(self.base+"privacy/review/", data).status_code, 403)
        self.client.force_authenticate(self.owner)
        result = self.client.post(self.base+"privacy/review/", data)
        self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(result.data["status"], "completed_with_retention")
        self.customer.refresh_from_db(); self.assertFalse(self.customer.is_active)
        self.assertFalse(self.customer.has_usable_password())
        self.assertTrue(self.customer.email.endswith("@deleted.invalid"))
        self.assertFalse((Path(self.storage.name)/doc.storage_name).exists())

    def test_owner_can_place_and_release_hold(self):
        response = self.client.post(self.base+"privacy/requests/", {"kind": "access"})
        self.client.force_authenticate(self.owner)
        data = {"id": response.data["id"], "action": "hold", "resolution": "Unresolved claim"}
        self.assertEqual(self.client.post(self.base+"privacy/review/", data).status_code, 200)
        self.assertTrue(DataHold.objects.filter(customer=self.customer).exists())
        data["action"] = "release_hold"
        self.assertEqual(self.client.post(self.base+"privacy/review/", data).status_code, 200)
        self.assertFalse(DataHold.objects.exists())

    def test_upload_requires_consent_before_reading_file(self):
        booking = WorkflowTests.booking(self)
        response = self.client.post(self.base+f"bookings/{booking.pk}/documents/", {"kind": "id_front"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Consent", str(response.data))
        self.assertFalse(PrivateDocument.objects.exists())

    def test_profile_identity_collection_requires_approved_notice(self):
        self.policy.privacy_notice_text = ""; self.policy.save()
        response = self.client.post(self.base+"profile/", self.details, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("approved privacy notice", str(response.data))

    def test_erased_profile_cannot_reuse_old_kyc(self):
        self.old_data(); run_retention()
        booking = WorkflowTests.booking(self)
        response = self.client.post(self.base+f"bookings/{booking.pk}/reuse-documents/")
        self.assertEqual(response.status_code, 400)
