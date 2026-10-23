import uuid
from django.conf import settings
from django.db import models


class AuditEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT)
    action = models.CharField(max_length=100)
    entity = models.CharField(max_length=80)
    entity_id = models.CharField(max_length=80)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise ValueError("Audit events cannot be changed.")
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValueError("Audit events cannot be deleted.")


class StaffAuthenticator(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    secret_encrypted = models.TextField()
    enabled = models.BooleanField(default=False)
    last_counter = models.BigIntegerField(default=-1)


class CustomerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    details_encrypted = models.TextField(blank=True)
    id_hash = models.CharField(max_length=64, blank=True, db_index=True)
    licence_hash = models.CharField(max_length=64, blank=True, db_index=True)
    phone_verified_at = models.DateTimeField(null=True, blank=True)
    verified_phone_hash = models.CharField(max_length=64, blank=True)
    blocked = models.BooleanField(default=False)
    block_reason = models.TextField(blank=True)


class PhoneChallenge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code_hash = models.CharField(max_length=128)
    phone_hash = models.CharField(max_length=64)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    consumed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)


class Policy(models.Model):
    id = models.PositiveSmallIntegerField(primary_key=True, default=1, editable=False)
    minimum_age = models.PositiveSmallIntegerField(null=True, blank=True)
    minimum_licence_months = models.PositiveSmallIntegerField(null=True, blank=True)
    staffed_start = models.TimeField(null=True, blank=True)
    staffed_end = models.TimeField(null=True, blank=True)
    staffed_weekdays = models.JSONField(default=list, blank=True)
    category_rules = models.JSONField(default=dict, blank=True)
    privacy_notice_text = models.TextField(blank=True)
    privacy_notice_version = models.CharField(max_length=50, blank=True)
    retention_days = models.PositiveIntegerField(null=True, blank=True)


class PrivateDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey("rentals.Booking", on_delete=models.PROTECT)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    kind = models.CharField(max_length=30, choices=[(x, x) for x in ["id_front", "id_back", "licence_front", "licence_back"]])
    storage_name = models.CharField(max_length=80)
    content_type = models.CharField(max_length=30)
    checksum = models.CharField(max_length=64)
    size = models.PositiveIntegerField()
    device = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class KycCase(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.OneToOneField("rentals.Booking", on_delete=models.PROTECT)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="kyc_cases")
    status = models.CharField(max_length=30, default="submitted")
    details_encrypted = models.TextField()
    document_ids = models.JSONField(default=list)
    consent_version = models.CharField(max_length=50)
    consent_at = models.DateTimeField()
    submitted_at = models.DateTimeField()
    due_at = models.DateTimeField(null=True, blank=True)
    alerted_15 = models.BooleanField(default=False)
    alerted_25 = models.BooleanField(default=False)
    missed = models.BooleanField(default=False)
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.PROTECT, related_name="reviewed_cases")
    reason = models.TextField(blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    checks = models.JSONField(default=dict)


class KycDecision(models.Model):
    case = models.ForeignKey(KycCase, on_delete=models.PROTECT, related_name="decisions")
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    decision = models.CharField(max_length=30)
    reason = models.TextField(blank=True)
    checks = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)


class BookingHistory(models.Model):
    booking = models.ForeignKey("rentals.Booking", on_delete=models.PROTECT, related_name="history")
    previous = models.CharField(max_length=40, blank=True)
    current = models.CharField(max_length=40)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.PROTECT)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class VehicleDocument(models.Model):
    car = models.ForeignKey("rentals.Car", on_delete=models.PROTECT, related_name="documents")
    kind = models.CharField(max_length=30, choices=[("insurance", "Insurance"), ("inspection", "Inspection")])
    reference = models.CharField(max_length=100)
    expires_on = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)


class VehicleBlock(models.Model):
    car = models.ForeignKey("rentals.Car", on_delete=models.PROTECT, related_name="blocks")
    starts_on = models.DateField()
    ends_on = models.DateField()
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.CheckConstraint(condition=models.Q(ends_on__gt=models.F("starts_on")), name="block_valid_dates")]
