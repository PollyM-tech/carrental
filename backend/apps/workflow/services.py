from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError
from .models import AuditEvent, BookingHistory, VehicleDocument, VehicleBlock, Notification, Policy
from apps.rentals.models import Booking

BLOCKING = ["kyc_approved", "awaiting_payment", "payment_pending_verification", "confirmed", "handover_in_progress", "active", "returned"]
TRANSITIONS = {
    "draft": ["kyc_submitted", "cancelled"],
    "kyc_submitted": ["kyc_in_review", "cancelled"],
    "kyc_in_review": ["kyc_needs_correction", "kyc_rejected", "kyc_approved", "cancelled"],
    "kyc_needs_correction": ["kyc_submitted", "cancelled"],
    "kyc_approved": ["awaiting_payment", "expired"],
    "awaiting_payment": ["payment_pending_verification", "expired", "cancelled"],
    "payment_pending_verification": ["confirmed", "expired", "cancelled"],
    "confirmed": ["handover_in_progress", "no_show", "cancelled"],
    "handover_in_progress": ["active", "handover_failed"],
    "active": ["returned"], "returned": ["closed"],
}


def audit(actor, action, obj, reason=""):
    return AuditEvent.objects.create(actor=actor if actor and actor.is_authenticated else None, action=action, entity=obj._meta.label, entity_id=str(obj.pk), reason=reason)


def transition(booking, target, actor, reason=""):
    if target not in TRANSITIONS.get(booking.status, []):
        raise ValidationError(f"Cannot move from {booking.status} to {target}.")
    previous = booking.status
    booking.status = target
    booking.save()
    BookingHistory.objects.create(booking=booking, previous=previous, current=target, actor=actor, reason=reason)
    audit(actor, "booking." + target, booking, reason)


def date_range(data):
    try:
        start = datetime.strptime(str(data.get("pickupDate", "")), "%Y-%m-%d").date()
        end = datetime.strptime(str(data.get("returnDate", "")), "%Y-%m-%d").date()
    except ValueError:
        raise ValidationError("Pickup and return dates must use YYYY-MM-DD.")
    if start < timezone.localdate() or end <= start:
        raise ValidationError("Choose a future rental with return after pickup.")
    return start, end


def vehicle_available(car, start, end, exclude=None):
    if car.deletedAt or car.status in ["maintenance", "unavailable"]:
        return False
    for kind in ["insurance", "inspection"]:
        if not VehicleDocument.objects.filter(car=car, kind=kind, expires_on__gte=end).exists():
            return False
    if VehicleBlock.objects.filter(car=car, starts_on__lt=end, ends_on__gt=start).exists():
        return False
    return not Booking.objects.filter(car=car, status__in=BLOCKING, pickupDate__lt=end, returnDate__gt=start).exclude(pk=exclude).exists()


def staffed_due(start, minutes=30):
    policy = Policy.objects.filter(pk=1).first()
    if not policy or not policy.staffed_start or not policy.staffed_end or not policy.staffed_weekdays:
        return start + timedelta(minutes=minutes)
    current = timezone.localtime(start, ZoneInfo("Africa/Nairobi"))
    remaining = minutes * 60
    for _ in range(370):
        opening = datetime.combine(current.date(), policy.staffed_start, tzinfo=current.tzinfo)
        closing = datetime.combine(current.date(), policy.staffed_end, tzinfo=current.tzinfo)
        if current.weekday() in policy.staffed_weekdays and current < closing:
            current = max(current, opening)
            available = (closing-current).total_seconds()
            if remaining <= available:
                return current + timedelta(seconds=remaining)
            remaining -= available
        current = datetime.combine(current.date()+timedelta(days=1), datetime.min.time(), tzinfo=current.tzinfo)
    raise ValidationError("Staffed hours configuration is invalid.")


def expire_holds():
    now = timezone.now()
    with transaction.atomic():
        for booking in Booking.objects.select_for_update().filter(status__in=["kyc_approved", "awaiting_payment", "payment_pending_verification"], hold_expires_at__lte=now):
            transition(booking, "expired", None, "Payment hold expired")
            Notification.objects.create(user=booking.customer, message="Your payment hold expired. Please start a new booking.")
