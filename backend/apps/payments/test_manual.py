from datetime import timedelta
from unittest.mock import patch
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase
from . import tests as fixtures
from .models import BookingPayment, PaymentAttempt, PaymentReceipt, ManualSubmission


@override_settings(PAYMENT_PROVIDER="manual_mpesa", MPESA_RECEIVING_PHONE="+254716741039", PASSWORD_HASHERS=fixtures.FAST_PASSWORDS)
class ManualPaymentTests(APITestCase):
    def setUp(self):
        fixtures.PaymentTests.setUp(self)

    def quote(self):
        result = self.client.post(self.base+f"bookings/{self.booking.pk}/", {}, format="json")
        self.assertEqual(result.status_code, 201, result.data)
        return result.data

    def submit(self, quote, code="UK1234ABCD"):
        return self.client.post(self.base+f"manual/{quote['id']}/submit/", {"accept_amount": True, "transaction_code": code}, format="json")

    def decision(self, quote, **updates):
        self.client.force_authenticate(self.owner)
        data = {"action": "confirm", "amount_minor": 1500000, "paid_at": timezone.now().isoformat(), "checked_receiving_account": True, "reason": "Checked transaction in the dedicated receiving account"}
        data.update(updates)
        return self.client.post(self.base+f"manual/{quote['id']}/decision/", data, format="json")

    def test_capabilities_and_exact_amount_without_paystack_surcharge(self):
        self.assertEqual(self.client.get(self.base+"capabilities/").data["provider"], "manual_mpesa")
        quote = self.quote()
        self.assertEqual(quote["total_minor"], 1500000)
        self.assertEqual(quote["surcharge_minor"], 0)
        self.assertEqual(quote["receiving_phone"], "+254716741039")
        self.assertEqual(quote["domain"], "manual")

    def test_customer_code_never_confirms_booking(self):
        quote = self.quote()
        self.assertEqual(self.submit(quote).data["status"], "submitted")
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.status, "payment_pending_verification")
        self.assertFalse(BookingPayment.objects.exists())
        self.assertFalse(PaymentReceipt.objects.exists())
        self.assertEqual(self.submit(quote).status_code, 200)
        self.assertEqual(ManualSubmission.objects.count(), 1)
        self.assertEqual(self.submit(quote, "XX1234ABCD").status_code, 400)
        self.assertEqual(self.quote()["id"], quote["id"])

    def test_finance_records_receipt_and_confirms_once(self):
        quote = self.quote(); self.submit(quote)
        result = self.decision(quote)
        self.assertEqual(result.status_code, 200, result.data)
        self.assertEqual(result.data["status"], "confirmed")
        self.assertIsNone(PaymentReceipt.objects.get().provider_fee_minor)
        self.assertEqual(BookingPayment.objects.count(), 1)
        self.assertEqual(self.decision(quote).status_code, 200)
        self.assertEqual(PaymentReceipt.objects.count(), 1)
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "confirmed")

    def test_customer_and_unrelated_staff_cannot_verify(self):
        quote = self.quote(); self.submit(quote)
        response = self.client.post(self.base+f"manual/{quote['id']}/decision/", {"action": "confirm"})
        self.assertEqual(response.status_code, 403)
        self.client.force_authenticate(self.reviewer)
        self.assertEqual(self.client.post(self.base+f"manual/{quote['id']}/decision/", {}).status_code, 403)

    def test_other_customer_cannot_submit_or_see_claim(self):
        quote = self.quote(); self.client.force_authenticate(self.other)
        self.assertEqual(self.submit(quote).status_code, 404)
        self.assertEqual(self.client.get(self.base+f"bookings/{self.booking.pk}/").status_code, 404)

    def test_receiving_account_check_and_reason_are_required(self):
        quote = self.quote(); self.submit(quote)
        self.assertEqual(self.decision(quote, checked_receiving_account=False).status_code, 400)
        self.assertEqual(self.decision(quote, reason="").status_code, 400)
        self.assertEqual(self.decision(quote, paid_at=(timezone.now()+timedelta(hours=1)).isoformat()).status_code, 400)
        self.assertFalse(PaymentReceipt.objects.exists())

    def test_amount_mismatch_records_funds_without_confirming(self):
        quote = self.quote(); self.submit(quote)
        result = self.decision(quote, amount_minor=1400000)
        self.assertEqual(result.data["status"], "manual_review")
        self.assertTrue(PaymentReceipt.objects.exists())
        self.assertFalse(BookingPayment.objects.exists())
        self.assertEqual(self.decision(quote).status_code, 400)

    def test_late_claim_is_received_for_review_without_reserving_car(self):
        quote = self.quote()
        self.booking.hold_expires_at = timezone.now()-timedelta(seconds=1)
        self.booking.status = "expired"; self.booking.save()
        self.assertEqual(self.submit(quote).status_code, 200)
        self.assertEqual(self.decision(quote).data["status"], "manual_review")
        self.assertFalse(BookingPayment.objects.exists())
        self.booking.refresh_from_db(); self.assertEqual(self.booking.status, "expired")

    def test_rejection_requires_reason_and_allows_corrected_submission(self):
        quote = self.quote(); self.submit(quote)
        self.assertEqual(self.decision(quote, action="reject", reason="No matching receipt in receiving account").data["status"], "failed")
        self.assertFalse(PaymentReceipt.objects.exists())
        self.client.force_authenticate(self.customer)
        self.assertNotEqual(self.quote()["id"], quote["id"])

    def test_duplicate_verified_code_cannot_be_allocated_twice(self):
        quote = self.quote(); self.submit(quote)
        self.decision(quote, amount_minor=1400000)
        # A different booking/claim can contain the same code, but finance cannot record funds twice.
        attempt = PaymentAttempt.objects.get(pk=quote["id"])
        attempt.pk = None; attempt._state.adding = True
        attempt.reference = "MOV-another-manual-attempt"; attempt.save()
        from .models import PaymentState
        PaymentState.objects.create(attempt=attempt, status="submitted", consent_at=timezone.now())
        ManualSubmission.objects.create(attempt=attempt, transaction_code="UK1234ABCD")
        result = self.decision({"id": str(attempt.pk)})
        self.assertEqual(result.status_code, 400)
        self.assertEqual(PaymentReceipt.objects.count(), 1)

    def test_kyc_changes_block_confirmation_but_preserve_received_funds(self):
        quote = self.quote(); self.submit(quote)
        self.case.status = "rejected"; self.case.save()
        self.assertEqual(self.decision(quote).data["status"], "manual_review")
        self.assertTrue(PaymentReceipt.objects.exists())
        self.assertFalse(BookingPayment.objects.exists())

    def test_hosted_checkout_disabled_and_status_does_not_call_provider(self):
        quote = self.quote(); self.submit(quote)
        with patch("apps.payments.paystack.verify") as verify:
            self.assertEqual(self.client.post(self.base+"verify/", {"reference": quote["reference"]}).data["status"], "submitted")
            verify.assert_not_called()
        self.assertEqual(self.client.post(self.base+f"checkout/{quote['id']}/", {"accept_charges": True}, format="json").status_code, 400)

    def test_unapproved_deposit_policy_still_blocks_payment(self):
        self.deposit_policy.deposit_timing = "pending"; self.deposit_policy.save()
        self.assertEqual(self.client.post(self.base+f"bookings/{self.booking.pk}/", {}).status_code, 400)

    def test_invalid_code_and_missing_consent_are_rejected(self):
        quote = self.quote()
        self.assertEqual(self.submit(quote, "bad").status_code, 400)
        self.assertEqual(self.client.post(self.base+f"manual/{quote['id']}/submit/", {"transaction_code": "UK1234ABCD"}).status_code, 400)
