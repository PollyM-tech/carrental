"""Customer claims are never proof of funds; finance checks the receiving account."""
import re
from datetime import timedelta
from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from apps.rentals.models import Booking, Car
from apps.workflow.services import transition
from .models import ManualSubmission, PaymentAttempt, PaymentState, PaymentReceipt
from .services import ACTIVE, payment_event, finance_alert, allocate_receipt, review


def submit(attempt, customer, code):
    if settings.PAYMENT_PROVIDER != "manual_mpesa" or attempt.provider != "manual_mpesa":
        raise ValidationError("Manual Send Money is not active for this payment.")
    if not isinstance(code, str) or not re.fullmatch(r"[A-Z0-9]{10}", code.strip().upper()):
        raise ValidationError("Enter the 10-character M-Pesa transaction code from your receipt.")
    code = code.strip().upper()
    with transaction.atomic():
        Car.objects.select_for_update().get(pk=attempt.booking.car_id)
        booking = Booking.objects.select_for_update(of=("self",)).select_related("car", "customer").get(pk=attempt.booking_id)
        state = PaymentState.objects.select_for_update().get(attempt=attempt)
        existing = ManualSubmission.objects.filter(attempt=attempt).first()
        if existing:
            if existing.transaction_code != code:
                raise ValidationError("A transaction code was already submitted. Contact finance to correct it.")
            return state
        if state.status != "quoted":
            raise ValidationError("This payment cannot accept another transaction code.")
        # Accept late claims for reconciliation, but never extend a hold or reserve a car here.
        if PaymentAttempt.objects.filter(booking=booking, state__status__in=ACTIVE).exclude(pk=attempt.pk).exists():
            raise ValidationError("Another payment is awaiting verification. Contact finance before paying again.")
        ManualSubmission.objects.create(attempt=attempt, transaction_code=code)
        state.status = "submitted"
        state.consent_at = timezone.now()
        state.save()
        if booking.status == "awaiting_payment" and booking.hold_expires_at and booking.hold_expires_at > timezone.now():
            transition(booking, "payment_pending_verification", customer, "Customer submitted an M-Pesa Send Money transaction code; receipt not yet verified")
        payment_event(attempt, "manual_submitted", customer)
        finance_alert(attempt, "Customer submitted a Send Money transaction code. Check the receiving account.")
        return state


def decide(attempt, actor, data):
    if attempt.provider != "manual_mpesa":
        raise ValidationError("This is not a manual M-Pesa payment.")
    reason = data.get("reason", "")
    if not isinstance(reason, str) or not reason.strip() or len(reason) > 2000:
        raise ValidationError("Record your receiving-account verification findings (up to 2000 characters).")
    action = data.get("action")
    if action not in ["confirm", "reject"]:
        raise ValidationError("Choose confirm or reject.")
    with transaction.atomic():
        Car.objects.select_for_update().get(pk=attempt.booking.car_id)
        booking = Booking.objects.select_for_update(of=("self",)).select_related("car", "customer").get(pk=attempt.booking_id)
        state = PaymentState.objects.select_for_update().get(attempt=attempt)
        submission = ManualSubmission.objects.filter(attempt=attempt).first()
        if not submission:
            raise ValidationError("No customer transaction code has been submitted.")
        if PaymentReceipt.objects.filter(attempt=attempt).exists():
            if state.status == "confirmed" and action == "confirm":
                return state
            raise ValidationError("A receipt is already recorded. Add a finance follow-up note; receipts cannot be changed.")
        if state.status not in ["submitted", "manual_review"]:
            raise ValidationError("This submission has already been reviewed.")
        if action == "reject":
            state.status = "failed"
            state.review_reason = reason.strip()
            state.save()
            payment_event(attempt, "manual_rejected", actor, reason=reason.strip())
            from apps.workflow.models import Notification
            Notification.objects.create(user=attempt.customer, message=f"Payment {attempt.reference} could not be verified: {reason.strip()}. Contact Movara before sending any more money.")
            return state
        from rest_framework import serializers
        class ReceiptInput(serializers.Serializer):
            amount_minor = serializers.IntegerField(min_value=1)
            paid_at = serializers.DateTimeField()
            checked_receiving_account = serializers.BooleanField()
        form = ReceiptInput(data=data)
        form.is_valid(raise_exception=True)
        values = form.validated_data
        if values["checked_receiving_account"] is not True:
            raise ValidationError("Check the transaction in the receiving account before confirming.")
        if values["paid_at"] > timezone.now()+timedelta(minutes=5):
            raise ValidationError("The receipt payment time cannot be in the future.")
        try:
            with transaction.atomic():
                receipt = PaymentReceipt.objects.create(attempt=attempt, provider_transaction_id="MPESA-"+submission.transaction_code,
                    reference=attempt.reference, currency="KES", amount_minor=values["amount_minor"], provider_fee_minor=None,
                    channel="manual_mpesa", paid_at=values["paid_at"])
        except IntegrityError:
            raise ValidationError("This M-Pesa transaction is already recorded for another payment.") from None
        payment_event(attempt, "manual_receipt_verified", actor, reason=reason.strip(), amount_minor=receipt.amount_minor,
                      receiving_phone=attempt.receiving_phone)
        if receipt.amount_minor != attempt.requested_minor:
            review(attempt, state, "The amount received differs from the booking total. Finance must arrange the balance or refund.", actor)
            return state
        if receipt.paid_at < attempt.created_at-timedelta(minutes=5):
            review(attempt, state, "The payment predates this quote. Finance must reconcile it.", actor)
            return state
        # Reuse all hold, KYC, availability and immutable allocation guards.
        return allocate_receipt(attempt, booking, state, receipt, actor)
