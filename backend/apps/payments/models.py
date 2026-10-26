import uuid
from django.conf import settings
from django.db import models
from apps.workflow.fields import EncryptedEmailField


class ImmutableRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Payment ledger records are append-only.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Payment ledger records cannot be deleted.")


class PaymentPolicy(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    deposit_timing = models.CharField(max_length=20, default="pending", choices=[(s, s) for s in ["pending", "online", "handover", "none"]])
    deposit_amounts = models.JSONField(default=dict, blank=True)


class PaymentAttempt(ImmutableRecord):
    provider = models.CharField(max_length=20, default="paystack")
    receiving_till = models.CharField(max_length=10, blank=True)
    receiving_phone = models.CharField(max_length=20, blank=True)
    booking = models.ForeignKey("rentals.Booking", on_delete=models.PROTECT, related_name="payment_attempts")
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    customer_email = EncryptedEmailField()
    kyc = models.ForeignKey("workflow.KycCase", on_delete=models.PROTECT)
    reference = models.CharField(max_length=80, unique=True)
    currency = models.CharField(max_length=3, default="KES")
    domain = models.CharField(max_length=10)
    channel = models.CharField(max_length=20)
    fee_mode = models.CharField(max_length=20)
    fee_rate_bps = models.PositiveIntegerField(default=0)
    rental_minor = models.PositiveBigIntegerField()
    deposit_minor = models.PositiveBigIntegerField(default=0)
    handover_deposit_minor = models.PositiveBigIntegerField(default=0)
    base_minor = models.PositiveBigIntegerField()
    surcharge_minor = models.PositiveBigIntegerField(null=True)
    requested_minor = models.PositiveBigIntegerField()
    hold_expires_at = models.DateTimeField()
    quote_expires_at = models.DateTimeField()


    class Meta(ImmutableRecord.Meta):
        constraints = [
            models.CheckConstraint(condition=models.Q(base_minor=models.F("rental_minor")+models.F("deposit_minor")), name="payment_base_matches_breakdown"),
            models.CheckConstraint(condition=models.Q(requested_minor__gte=models.F("base_minor")) & models.Q(base_minor__gt=0), name="payment_positive_total"),
            models.CheckConstraint(condition=models.Q(currency="KES"), name="payment_currency_kes"),
        ]


class PaymentState(models.Model):
    # Mutable projection. The source attempt, events and receipt remain immutable.
    attempt = models.OneToOneField(PaymentAttempt, primary_key=True, on_delete=models.PROTECT, related_name="state")
    status = models.CharField(max_length=30, default="quoted")
    authorization_url = models.URLField(max_length=1000, blank=True)
    consent_at = models.DateTimeField(null=True)
    last_checked_at = models.DateTimeField(null=True)
    check_count = models.PositiveIntegerField(default=0)
    review_reason = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)


class PaymentEvent(ImmutableRecord):
    attempt = models.ForeignKey(PaymentAttempt, on_delete=models.PROTECT, related_name="events")
    kind = models.CharField(max_length=40)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT)
    details = models.JSONField(default=dict)


class PaymentReceipt(ImmutableRecord):
    attempt = models.OneToOneField(PaymentAttempt, on_delete=models.PROTECT, related_name="receipt")
    provider_transaction_id = models.CharField(max_length=30, unique=True)
    reference = models.CharField(max_length=80, unique=True)
    currency = models.CharField(max_length=3)
    amount_minor = models.PositiveBigIntegerField()
    provider_fee_minor = models.PositiveBigIntegerField(null=True)
    channel = models.CharField(max_length=30)
    paid_at = models.DateTimeField()


class BookingPayment(ImmutableRecord):
    booking = models.OneToOneField("rentals.Booking", on_delete=models.PROTECT, related_name="confirmed_payment")
    receipt = models.OneToOneField(PaymentReceipt, on_delete=models.PROTECT)


class WebhookInbox(models.Model):
    digest = models.CharField(max_length=64, primary_key=True)
    event = models.CharField(max_length=60)
    reference = models.CharField(max_length=80)
    received_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True)
    attempts = models.PositiveIntegerField(default=0)
    last_error = models.CharField(max_length=80, blank=True)


class FinanceNote(ImmutableRecord):
    attempt = models.ForeignKey(PaymentAttempt, on_delete=models.PROTECT, related_name="finance_notes")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    reason = models.TextField()


class ManualSubmission(ImmutableRecord):
    attempt = models.OneToOneField(PaymentAttempt, on_delete=models.PROTECT, related_name="submission")
    transaction_code = models.CharField(max_length=10)
