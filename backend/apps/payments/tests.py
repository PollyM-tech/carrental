import hashlib
import hmac
import json
from datetime import timedelta
from io import BytesIO, StringIO
from unittest.mock import patch
from urllib.error import URLError
from django.conf import settings
from django.core.management import call_command
from django.db import DatabaseError, IntegrityError, connection, transaction
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from apps.rentals.models import Booking, Car
from apps.workflow.models import KycCase, Notification
from apps.workflow.security import encrypt
from apps.workflow import tests as workflow_fixtures
FAST_PASSWORDS = workflow_fixtures.FAST_PASSWORDS
from . import paystack
from .models import BookingPayment, FinanceNote, PaymentAttempt, PaymentEvent, PaymentPolicy, PaymentReceipt, PaymentState, WebhookInbox
from .services import calculate_quote, create_quote, initialize_checkout, verify_payment


@override_settings(PAYMENT_PROVIDER="paystack", PASSWORD_HASHERS=FAST_PASSWORDS, DEBUG=True, PAYSTACK_SECRET_KEY="sk_test_example", PAYSTACK_MODE="test", PAYSTACK_FEE_MODE="gross_up", PAYSTACK_MPESA_RATE_BPS=150, PAYSTACK_PASS_FEES_ENABLED=False, PAYSTACK_CALLBACK_URL="http://localhost:3000/payment/return")
class PaymentTests(APITestCase):
    def setUp(self):
        workflow_fixtures.WorkflowTests.setUp(self)
        self.deposit_policy = PaymentPolicy.objects.create(deposit_timing="none")
        self.booking = Booking.objects.create(customer=self.customer, car=self.car, carName=self.car.name, customerName="Test", customerEmail=self.customer.email, customerPhone=self.customer.phone, pickupDate=self.start, returnDate=self.end, totalAmount=15000, totalDays=3, status="awaiting_payment", hold_expires_at=timezone.now()+timedelta(minutes=30))
        self.case = KycCase.objects.create(booking=self.booking, customer=self.customer, details_encrypted=encrypt(self.details), consent_version="test-v1", consent_at=timezone.now(), submitted_at=timezone.now(), status="approved", approved_at=timezone.now())
        self.base = "/api/v1/payments/"

    def quote(self):
        return create_quote(self.booking.pk, self.customer, "mobile_money")

    def started(self):
        attempt = self.quote()
        with patch("apps.payments.paystack.initialize", return_value="https://checkout.paystack.com/test-session"):
            initialize_checkout(attempt, self.customer)
        return attempt

    def success(self, attempt, **updates):
        data = {"id": 987654321, "status": "success", "reference": attempt.reference, "currency": "KES", "domain": "test", "amount": attempt.requested_minor, "requested_amount": attempt.requested_minor, "fees": (attempt.requested_minor*150+9999)//10000, "channel": attempt.channel, "paid_at": timezone.now().isoformat(), "metadata": {"booking_id": str(attempt.booking_id), "payment_id": str(attempt.pk)}, "customer": {"email": self.customer.email}}
        data.update(updates)
        return data

    def verify_with(self, attempt, **updates):
        with patch("apps.payments.paystack.verify", return_value=self.success(attempt, **updates)):
            return verify_payment(attempt)

    def webhook(self, payload, valid=True):
        raw = json.dumps(payload).encode()
        signature = hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), raw, hashlib.sha512).hexdigest() if valid else "fake"
        return self.client.post(self.base+"webhook/", raw, content_type="application/json", HTTP_X_PAYSTACK_SIGNATURE=signature)

    def test_quote_uses_integer_gross_up_and_ignores_client_amount(self):
        response = self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money", "total_minor": 1}, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        base, total = response.data["base_minor"], response.data["total_minor"]
        self.assertEqual(base, 1500000)
        self.assertEqual(total, (base*10000+9849)//9850)
        self.assertEqual(response.data["surcharge_minor"], total-base)
        self.assertGreaterEqual(total-(total*150+9999)//10000, base)

    def test_gross_up_covers_fee_in_small_and_large_amounts(self):
        for rental in [1, 2, 19, 100, 101, 1000, 15000, 100000]:
            self.booking.totalAmount = rental
            result = calculate_quote(self.booking, "mobile_money")
            gross = result["requested_minor"]
            self.assertGreaterEqual(gross-(gross*150+9999)//10000, rental*100)

    def test_pending_deposit_policy_blocks_checkout(self):
        self.deposit_policy.deposit_timing = "pending"; self.deposit_policy.save()
        response = self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money"})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(PaymentAttempt.objects.count(), 0)

    def test_online_deposit_is_included_in_fee_base(self):
        self.deposit_policy.deposit_timing = "online"; self.deposit_policy.deposit_amounts = {"SUV": 10000}; self.deposit_policy.save()
        result = calculate_quote(self.booking, "mobile_money")
        self.assertEqual(result["deposit_minor"], 1000000)
        self.assertEqual(result["base_minor"], 2500000)
        self.assertEqual(result["handover_deposit_minor"], 0)

    def test_handover_deposit_is_disclosed_but_not_charged_online(self):
        self.deposit_policy.deposit_timing = "handover"; self.deposit_policy.deposit_amounts = {"SUV": 10000}; self.deposit_policy.save()
        result = calculate_quote(self.booking, "mobile_money")
        self.assertEqual(result["base_minor"], 1500000)
        self.assertEqual(result["handover_deposit_minor"], 1000000)

    def test_missing_category_deposit_blocks_quote(self):
        self.deposit_policy.deposit_timing = "online"; self.deposit_policy.save()
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money"}).status_code, 400)

    def test_unapproved_kyc_blocks_payments(self):
        self.case.status = "in_review"; self.case.save()
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money"}).status_code, 400)

    def test_draft_booking_cannot_pay(self):
        self.booking.status = "draft"; self.booking.save()
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money"}).status_code, 400)

    def test_other_customer_cannot_quote_checkout_or_verify(self):
        attempt = self.started(); self.client.force_authenticate(self.other)
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money"}).status_code, 404)
        self.assertEqual(self.client.post(self.base+f"checkout/{attempt.pk}/", {"accept_charges": True}).status_code, 404)
        self.assertEqual(self.client.post(self.base+"verify/", {"reference": attempt.reference}).status_code, 404)

    def test_expired_hold_cannot_pay(self):
        self.booking.hold_expires_at = timezone.now()-timedelta(seconds=1); self.booking.save()
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "mobile_money"}).status_code, 400)
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "expired")

    @patch("apps.payments.paystack.initialize", return_value="https://checkout.paystack.com/test")
    def test_consent_is_required_and_checkout_is_idempotent(self, initialize):
        attempt = self.quote()
        url = self.base+f"checkout/{attempt.pk}/"
        self.assertEqual(self.client.post(url, {}).status_code, 400)
        response = self.client.post(url, {"accept_charges": True}, format="json")
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(self.client.post(url, {"accept_charges": True}, format="json").status_code, 200)
        self.assertEqual(initialize.call_count, 1)
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "payment_pending_verification")

    def test_quote_expiry_requires_requote(self):
        attempt = self.quote()
        with patch("django.utils.timezone.now", return_value=timezone.now()+timedelta(minutes=6)):
            self.assertEqual(self.client.post(self.base+f"checkout/{attempt.pk}/", {"accept_charges": True}, format="json").status_code, 400)

    @override_settings(PAYSTACK_SECRET_KEY="")
    def test_unconfigured_paystack_does_not_start_payment(self):
        attempt = self.quote()
        response = self.client.post(self.base+f"checkout/{attempt.pk}/", {"accept_charges": True}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(PaymentState.objects.get(attempt=attempt).status, "quoted")
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "awaiting_payment")

    @patch("apps.payments.paystack.initialize", side_effect=paystack.ProviderUnavailable)
    def test_initialization_timeout_is_recoverable_without_double_checkout(self, initialize):
        attempt = self.quote()
        response = self.client.post(self.base+f"checkout/{attempt.pk}/", {"accept_charges": True}, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(PaymentState.objects.get(attempt=attempt).status, "initialization_unknown")
        self.assertEqual(self.quote().pk, attempt.pk)

    @patch("apps.payments.paystack.initialize", side_effect=paystack.ProviderRejected)
    def test_definitively_rejected_initialization_allows_new_quote(self, initialize):
        attempt = self.quote()
        self.client.post(self.base+f"checkout/{attempt.pk}/", {"accept_charges": True}, format="json")
        self.assertEqual(PaymentState.objects.get(attempt=attempt).status, "failed")
        self.assertNotEqual(self.quote().pk, attempt.pk)

    def test_success_confirms_booking_and_records_receipt_once(self):
        attempt = self.started()
        state = self.verify_with(attempt)
        self.assertEqual(state.status, "confirmed")
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "confirmed")
        self.verify_with(attempt)
        self.assertEqual(PaymentReceipt.objects.count(), 1)
        self.assertEqual(BookingPayment.objects.count(), 1)
        self.assertEqual(PaymentEvent.objects.filter(kind="confirmed").count(), 1)
        self.assertEqual(self.booking.history.filter(current="confirmed").count(), 1)

    def test_underpayment_and_overpayment_require_finance_review(self):
        for adjustment in [-100, 100]:
            attempt = self.started() if adjustment == -100 else self.quote_after_review()
            state = self.verify_with(attempt, amount=attempt.requested_minor+adjustment)
            self.assertEqual(state.status, "manual_review")
            self.assertFalse(BookingPayment.objects.exists())
            self.assertTrue(attempt.events.filter(kind="verified", details__amount_minor=attempt.requested_minor+adjustment).exists())

    def quote_after_review(self):
        return self.started()

    def test_wrong_currency_reference_domain_and_channel_never_confirm(self):
        attempt = self.started()
        for changes in [{"currency": "NGN"}, {"reference": "other-reference"}, {"domain": "live"}, {"channel": "card"}]:
            state = self.verify_with(attempt, **changes)
            self.assertEqual(state.status, "manual_review")
            self.assertFalse(BookingPayment.objects.exists())

    def test_provider_api_success_is_not_payment_success(self):
        attempt = self.started()
        state = self.verify_with(attempt, status="pending")
        self.assertEqual(state.status, "pending")
        self.assertFalse(PaymentReceipt.objects.exists())
        self.assertFalse(BookingPayment.objects.exists())

    def test_wrong_metadata_customer_or_invalid_amounts_are_rejected(self):
        attempt = self.started()
        for changes in [{"metadata": {}}, {"customer": {"email": "other@test.com"}}, {"fees": True}, {"amount": "15000"}, {"paid_at": "bad-date"}]:
            self.assertEqual(self.verify_with(attempt, **changes).status, "manual_review")
            self.assertFalse(BookingPayment.objects.exists())

    def test_gross_up_net_shortfall_is_not_confirmed(self):
        attempt = self.started()
        self.assertEqual(self.verify_with(attempt, fees=attempt.requested_minor).status, "manual_review")

    def test_late_success_is_received_but_not_reserved(self):
        attempt = self.started()
        self.booking.hold_expires_at = timezone.now()-timedelta(seconds=1); self.booking.status = "expired"; self.booking.save()
        self.assertEqual(self.verify_with(attempt).status, "manual_review")
        self.assertEqual(PaymentReceipt.objects.count(), 1)
        self.assertFalse(BookingPayment.objects.exists())
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "expired")

    def test_changed_customer_or_booking_amount_requires_review(self):
        attempt = self.started()
        self.booking.totalAmount = 16000; self.booking.save()
        self.assertEqual(self.verify_with(attempt).status, "manual_review")
        self.assertFalse(BookingPayment.objects.exists())

    def test_duplicate_payment_to_paid_booking_is_not_allocated_again(self):
        second = self.quote()
        first = self.started(); self.verify_with(first)
        state = PaymentState.objects.get(attempt=second); state.status = "pending"; state.consent_at = timezone.now(); state.save()
        self.assertEqual(self.verify_with(second, id=987654322).status, "manual_review")
        self.assertEqual(PaymentReceipt.objects.count(), 2)
        self.assertEqual(BookingPayment.objects.count(), 1)

    def test_pending_result_does_not_downgrade_confirmed_receipt(self):
        attempt = self.started(); self.verify_with(attempt)
        self.assertEqual(self.verify_with(attempt, status="pending").status, "confirmed")

    def test_reversal_is_flagged_for_finance(self):
        attempt = self.started(); self.verify_with(attempt)
        self.assertEqual(self.verify_with(attempt, status="reversed").status, "manual_review")
        self.assertTrue(PaymentReceipt.objects.exists())

    def test_unsigned_webhook_is_rejected(self):
        self.assertEqual(self.webhook({"event": "charge.success", "data": {"reference": "fake"}}, valid=False).status_code, 401)
        self.assertEqual(WebhookInbox.objects.count(), 0)

    def test_webhook_is_deduplicated_and_not_trusted_until_verification(self):
        attempt = self.started()
        payload = {"event": "charge.success", "data": {"reference": attempt.reference, "authorization": {"authorization_code": "DO_NOT_STORE"}}}
        for _ in range(2): self.assertEqual(self.webhook(payload).status_code, 200)
        self.assertEqual(WebhookInbox.objects.count(), 1)
        self.assertFalse(BookingPayment.objects.exists())
        with patch("apps.payments.paystack.verify", return_value=self.success(attempt)):
            call_command("process_payments", stdout=StringIO())
        self.assertEqual(BookingPayment.objects.count(), 1)
        self.assertIsNotNone(WebhookInbox.objects.get().processed_at)
        self.assertNotIn("DO_NOT_STORE", str(WebhookInbox.objects.values().get()))

    def test_unmatched_signed_webhook_is_visible_to_finance(self):
        self.webhook({"event": "charge.success", "data": {"reference": "external-payment"}})
        call_command("process_payments", stdout=StringIO())
        self.assertEqual(WebhookInbox.objects.get().last_error, "unmatched_reference")

    def test_customer_and_fleet_staff_cannot_access_finance(self):
        self.assertEqual(self.client.get(self.base+"finance/").status_code, 403)
        self.client.force_authenticate(self.fleet)
        self.assertEqual(self.client.get(self.base+"finance/").status_code, 403)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.get(self.base+"finance/").status_code, 200)

    def test_finance_notes_do_not_manually_confirm_payments(self):
        attempt = self.started(); self.client.force_authenticate(self.owner)
        response = self.client.post(self.base+f"finance/{attempt.pk}/notes/", {"reason": "Contacted customer; checking statement"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(FinanceNote.objects.count(), 1)
        self.assertFalse(BookingPayment.objects.exists())

    def test_deposit_policy_requires_owner_and_reason(self):
        self.assertEqual(self.client.post(self.base+"policy/", {"deposit_timing": "none"}).status_code, 403)
        self.client.force_authenticate(self.owner)
        self.assertEqual(self.client.post(self.base+"policy/", {"deposit_timing": "none"}).status_code, 400)
        self.assertEqual(self.client.post(self.base+"policy/", {"deposit_timing": "none", "deposit_amounts": {}, "reason": "Test-only decision"}, format="json").status_code, 200)

    def test_card_is_not_offered_under_flat_mpesa_fee(self):
        methods = self.client.get(self.base+"capabilities/").data["methods"]
        self.assertEqual([m["value"] for m in methods], ["mobile_money"])
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "card"}).status_code, 400)

    @override_settings(PAYSTACK_FEE_MODE="provider", PAYSTACK_PASS_FEES_ENABLED=True)
    def test_provider_managed_card_fee_is_exact_and_disclosed_at_checkout(self):
        attempt = create_quote(self.booking.pk, self.customer, "card")
        self.assertIsNone(attempt.surcharge_minor)
        self.assertEqual(attempt.requested_minor, attempt.base_minor)
        state = PaymentState.objects.get(attempt=attempt); state.status = "pending"; state.consent_at = timezone.now(); state.save()
        self.assertEqual(self.verify_with(attempt, amount=attempt.base_minor+45000, fees=45000, requested_amount=attempt.base_minor).status, "confirmed")

    @override_settings(PAYSTACK_FEE_MODE="provider", PAYSTACK_PASS_FEES_ENABLED=False)
    def test_provider_mode_requires_confirmed_fee_passing_setup(self):
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {"channel": "card"}).status_code, 400)

    def test_database_ledger_records_are_immutable(self):
        if connection.vendor != "postgresql": self.skipTest("PostgreSQL-specific guard")
        attempt = self.quote()
        with self.assertRaises(DatabaseError), transaction.atomic():
            PaymentAttempt.objects.filter(pk=attempt.pk).update(requested_minor=1)

    @patch("apps.payments.paystack.urlopen")
    def test_provider_initialize_is_server_side_and_uses_accepted_amount(self, urlopen):
        attempt = self.quote()
        urlopen.return_value = BytesIO(json.dumps({"status": True, "data": {"reference": attempt.reference, "authorization_url": "https://checkout.paystack.com/test"}}).encode())
        self.assertEqual(paystack.initialize(attempt), "https://checkout.paystack.com/test")
        req = urlopen.call_args.args[0]; payload = json.loads(req.data)
        self.assertEqual(req.get_header("Authorization"), "Bearer sk_test_example")
        self.assertEqual(payload["amount"], str(attempt.requested_minor))
        self.assertEqual(payload["channels"], ["mobile_money"])
        self.assertEqual(payload["metadata"]["booking_id"], str(self.booking.pk))

    @patch("apps.payments.paystack.urlopen", side_effect=URLError("sensitive provider details"))
    def test_provider_errors_do_not_expose_secrets(self, urlopen):
        with self.assertRaises(paystack.ProviderUnavailable) as error:
            paystack.verify("test-reference")
        self.assertNotIn("sensitive", str(error.exception))
        self.assertNotIn("sk_test", str(error.exception))

    def test_payment_without_recorded_fee_acceptance_requires_finance_review(self):
        attempt = self.quote()
        self.assertEqual(self.verify_with(attempt).status, "manual_review")
        self.assertEqual(PaymentReceipt.objects.count(), 1)
        self.assertEqual(BookingPayment.objects.count(), 0)

    def test_provider_discount_mismatch_does_not_silently_overcharge_client(self):
        attempt = self.started()
        self.assertEqual(self.verify_with(attempt, fees=0).status, "manual_review")
        self.assertFalse(BookingPayment.objects.exists())

    @override_settings(DEBUG=False)
    def test_test_key_is_not_usable_in_production(self):
        self.assertFalse(paystack.configuration_ready())

    def test_database_allocation_cannot_use_another_bookings_receipt(self):
        if connection.vendor != "postgresql": self.skipTest("PostgreSQL-specific guard")
        attempt = self.started(); self.verify_with(attempt)
        other = Booking.objects.create(customer=self.other, car=self.car, customerName="Other", pickupDate=self.start, returnDate=self.end)
        receipt = PaymentReceipt.objects.get(attempt=attempt)
        with self.assertRaises(DatabaseError), transaction.atomic():
            BookingPayment.objects.create(booking=other, receipt=receipt)

    def test_provider_transaction_cannot_be_reused_for_different_booking(self):
        attempt = self.started(); self.verify_with(attempt)
        Booking.objects.filter(pk=self.booking.pk).update(status="closed")
        new_booking = Booking.objects.create(customer=self.customer, car=self.car, carName=self.car.name, customerName="Test", pickupDate=self.start, returnDate=self.end, totalAmount=15000, status="awaiting_payment", hold_expires_at=timezone.now()+timedelta(minutes=30))
        KycCase.objects.create(booking=new_booking, customer=self.customer, status="approved", details_encrypted=encrypt(self.details), consent_version="test-v1", consent_at=timezone.now(), submitted_at=timezone.now())
        other_attempt = create_quote(new_booking.pk, self.customer, "mobile_money")
        state = PaymentState.objects.get(attempt=other_attempt); state.status = "pending"; state.consent_at = timezone.now(); state.save()
        self.assertEqual(self.verify_with(other_attempt).status, "manual_review")
        self.assertEqual(PaymentReceipt.objects.count(), 1)
        self.assertEqual(BookingPayment.objects.count(), 1)

    def test_statement_reconciliation_recovers_missed_webhook_and_flags_unmatched(self):
        attempt = self.started()
        rows = [{"id": 987654321, "reference": attempt.reference, "status": "success", "domain": "test"}, {"id": 99999, "reference": "outside-booking-system", "status": "success", "domain": "test"}]
        with patch("apps.payments.paystack.list_transactions", return_value=rows), patch("apps.payments.paystack.verify", return_value=self.success(attempt)):
            call_command("process_payments", reconcile=True, stdout=StringIO())
        self.assertEqual(BookingPayment.objects.count(), 1)
        self.assertEqual(WebhookInbox.objects.filter(last_error="unmatched_reference").count(), 1)

    def test_refund_review_is_not_cleared_by_repeated_success_result(self):
        attempt = self.started(); self.verify_with(attempt)
        state = PaymentState.objects.get(attempt=attempt); state.status = "manual_review"; state.review_reason = "Refund under review"; state.save()
        self.assertEqual(self.verify_with(attempt).status, "manual_review")
