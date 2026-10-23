import uuid
from django.db import models
from apps.workflow.fields import EncryptedEmailField, EncryptedTextField


class Record(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-createdAt"]


class Car(Record):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=80)
    pricePerDay = models.PositiveIntegerField()
    seats = models.PositiveSmallIntegerField()
    transmission = models.CharField(max_length=40)
    fuel = models.CharField(max_length=40)
    status = models.CharField(max_length=20, default="available", choices=[(s, s) for s in ["available", "booked", "maintenance", "unavailable"]])
    description = models.TextField(blank=True)
    isFeatured = models.BooleanField(default=False)
    imageUrl = models.CharField(max_length=1000, blank=True)
    image = models.ForeignKey("CarImage", null=True, blank=True, on_delete=models.PROTECT)
    rating = models.FloatField(null=True, blank=True)
    reviewCount = models.PositiveIntegerField(null=True, blank=True)
    brand = models.CharField(max_length=80, blank=True)
    model = models.CharField(max_length=80, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    plateNumber = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=200, blank=True)
    mileage = models.PositiveIntegerField(default=0)
    deletedAt = models.DateTimeField(null=True, blank=True)


    class Meta(Record.Meta):
        constraints = [models.UniqueConstraint(fields=["plateNumber"], condition=~models.Q(plateNumber=""), name="unique_vehicle_registration")]


class CarImage(Record):
    file = models.FileField(upload_to="cars/%Y/%m/", blank=True)
    cloudinaryPublicId = models.CharField(max_length=255, blank=True)
    secureUrl = models.URLField(max_length=1000, blank=True)


class Booking(Record):
    customer = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.PROTECT)
    hold_expires_at = models.DateTimeField(null=True, blank=True)
    car = models.ForeignKey(Car, null=True, blank=True, on_delete=models.PROTECT)
    carName = models.CharField(max_length=200, blank=True)
    customerName = models.CharField(max_length=200)
    customerEmail = EncryptedEmailField(blank=True)
    customerPhone = EncryptedTextField(blank=True)
    status = models.CharField(max_length=40, default="draft", choices=[(s, s) for s in [
        "draft", "kyc_submitted", "kyc_in_review", "kyc_needs_correction", "kyc_rejected",
        "kyc_approved", "awaiting_payment", "payment_pending_verification", "confirmed",
        "handover_in_progress", "handover_failed", "active", "returned", "closed", "cancelled", "expired", "no_show",
    ]])
    pickupDate = models.DateField(null=True, blank=True)
    returnDate = models.DateField(null=True, blank=True)
    pickupLocation = models.CharField(max_length=200, blank=True)
    returnLocation = models.CharField(max_length=200, blank=True)
    totalDays = models.PositiveIntegerField(null=True, blank=True)
    totalAmount = models.PositiveIntegerField(null=True, blank=True)
    message = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    cancelReason = models.TextField(blank=True)
    confirmedAt = models.DateTimeField(null=True, blank=True)
    cancelledAt = models.DateTimeField(null=True, blank=True)
    completedAt = models.DateTimeField(null=True, blank=True)


class BusinessSettings(Record):
    singleton = models.PositiveSmallIntegerField(default=1, unique=True, editable=False)
    businessName = models.CharField(max_length=200, default="Movara Car Hire")
    whatsappNumber = models.CharField(max_length=30, default="254716741039")
    phoneNumber = models.CharField(max_length=30, blank=True)
    email = models.EmailField(blank=True)
    location = models.CharField(max_length=200, blank=True)
