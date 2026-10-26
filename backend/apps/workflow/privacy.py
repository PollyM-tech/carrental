"""Operational-data erasure preserves immutable financial and audit evidence."""
from datetime import timedelta
from pathlib import Path
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Max
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from apps.rentals.models import Booking
from .models import CustomerProfile, DataRequest, DataHold, DocumentErasure, PrivateDocument, KycCase, PhoneChallenge, Notification, Policy
from .permissions import OwnerAccess
from .security import encrypt, decrypt
from .services import audit, transition

TERMINAL = ["closed", "cancelled", "expired", "kyc_rejected", "handover_failed", "no_show"]
RETAINED = "Operational profile, document files and KYC snapshots removed. Financial receipts, payment contact snapshots, immutable audit/review evidence and minimal document metadata remain for separate retention review. Copies in backups expire under the backup policy."


class PrivacyThrottle(UserRateThrottle):
    rate = "10/hour"
    scope = "privacy"


def pack(row, staff=False):
    data = {"id": str(row.pk), "kind": row.kind, "status": row.status, "created_at": row.created_at,
        "resolution": row.resolution, "resolved_at": row.resolved_at}
    if staff:
        hold = DataHold.objects.filter(customer=row.customer).first()
        data.update(customer=str(row.customer_id), email=row.customer.email, details=decrypt(row.details_encrypted), hold_reason=decrypt(hold.reason_encrypted) if hold else "")
    return data


def erase_operational(user, actor=None, cutoff=None, deactivate=False, dry_run=False):
    """Caller holds user lock. Never erase evidence for unresolved rentals/payments."""
    from apps.payments.models import PaymentAttempt
    if user.is_staff or user.is_superuser:
        raise serializers.ValidationError("Staff accounts require separate access and record review.")
    if DataHold.objects.filter(customer=user).exists():
        raise serializers.ValidationError("A documented retention hold prevents deletion. Owner review is required.")
    bookings = Booking.objects.filter(customer=user)
    if bookings.exclude(status__in=TERMINAL+["draft"]).exists():
        raise serializers.ValidationError("Resolve open rentals and bookings before erasing personal data.")
    if PaymentAttempt.objects.filter(customer=user).exclude(state__status__in=["confirmed", "failed", "quoted"]).exists():
        raise serializers.ValidationError("Resolve outstanding payment reconciliation before deletion.")
    if cutoff:
        profile = CustomerProfile.objects.filter(user=user).first()
        latest = bookings.aggregate(value=Max("updatedAt"))["value"]
        documents_latest = PrivateDocument.objects.filter(owner=user).aggregate(value=Max("created_at"))["value"]
        if any(value and value > cutoff for value in [latest, documents_latest, profile.updated_at if profile else user.date_joined]):
            return False
    if cutoff and DataRequest.objects.filter(customer=user, status="pending").exists():
        raise serializers.ValidationError("Resolve pending privacy requests before scheduled deletion.")
    if dry_run:
        return True
    for booking in bookings.filter(status="draft"):
        transition(booking, "cancelled", actor, "Personal-data erasure")
    documents = PrivateDocument.objects.filter(owner=user, erasure__isnull=True)
    root = Path(settings.PRIVATE_DOCUMENT_ROOT).resolve()
    # Unlink before tombstoning; a failure is retried and never marked successful.
    for doc in documents:
        path = (root/doc.storage_name).resolve()
        if path.parent != root:
            raise serializers.ValidationError("Document storage path needs operator review.")
        path.unlink(missing_ok=True)
        DocumentErasure.objects.get_or_create(document=doc, defaults={"reason": "retention" if cutoff else "customer_request"})
        audit(actor, "document.erased", doc)
    CustomerProfile.objects.filter(user=user).update(details_encrypted="", id_hash="", licence_hash="", phone_verified_at=None, verified_phone_hash="")
    KycCase.objects.filter(customer=user).update(details_encrypted="", document_ids=[], checks={}, reason="")
    PhoneChallenge.objects.filter(user=user).delete()
    if not cutoff:
        bookings.update(customerName="Removed", customerEmail="", customerPhone="", pickupLocation="", returnLocation="", message="", notes="", cancelReason="")
        Notification.objects.filter(user=user).delete()
        DataRequest.objects.filter(customer=user).update(details_encrypted="")
    if deactivate:
        user.email = f"removed-{user.pk}@deleted.invalid"
        user.phone = ""; user.first_name = ""; user.last_name = ""; user.is_active = False
        user.set_unusable_password(); user.save()
    audit(actor, "privacy.operational_data_erased", user, "retention" if cutoff else "customer_request")
    return True


def run_retention(dry_run=False):
    policy = Policy.objects.filter(pk=1).first()
    if not policy or not policy.retention_days or not policy.privacy_notice_version or not policy.privacy_notice_text:
        return {"enabled": False, "erased": 0, "held": 0}
    cutoff = timezone.now()-timedelta(days=policy.retention_days)
    result = {"enabled": True, "erased": 0, "eligible": 0, "held": 0}
    users = get_user_model().objects.filter(is_staff=False, is_superuser=False)
    for pk in users.values_list("pk", flat=True).iterator():
        with transaction.atomic():
            user = get_user_model().objects.select_for_update().get(pk=pk)
            has_data = CustomerProfile.objects.filter(user=user).exclude(details_encrypted="").exists() or PrivateDocument.objects.filter(owner=user, erasure__isnull=True).exists() or KycCase.objects.filter(customer=user).exclude(details_encrypted="").exists()
            if not has_data:
                continue
            try:
                if erase_operational(user, cutoff=cutoff, dry_run=dry_run):
                    result["eligible" if dry_run else "erased"] += 1
            except serializers.ValidationError:
                result["held"] += 1
    return result


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PrivacyThrottle])
def requests(request):
    if request.method == "GET":
        return Response([pack(row) for row in DataRequest.objects.filter(customer=request.user).order_by("-created_at")[:100]])
    class Input(serializers.Serializer):
        kind = serializers.ChoiceField(choices=["access", "correction", "deletion"])
        details = serializers.CharField(max_length=2000, required=False, default="", allow_blank=True)
        password = serializers.CharField(required=False, write_only=True)
    form = Input(data=request.data); form.is_valid(raise_exception=True)
    values = form.validated_data
    if values["kind"] == "deletion" and not request.user.check_password(values.get("password", "")):
        raise serializers.ValidationError("Confirm your current password to request account deletion.")
    if values["kind"] == "correction" and not values["details"].strip():
        raise serializers.ValidationError("Describe which details need correction. Do not include document numbers or photos here.")
    with transaction.atomic():
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        if DataRequest.objects.filter(customer=request.user, kind=values["kind"], status="pending").exists():
            raise serializers.ValidationError("You already have a pending request of this type.")
        obj = DataRequest.objects.create(customer=request.user, kind=values["kind"], details_encrypted=encrypt(values["details"]))
        audit(request.user, "privacy.requested", obj)
    return Response(pack(obj), status=201)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([PrivacyThrottle])
def export(request):
    from apps.payments.models import PaymentAttempt
    user = request.user
    profile = CustomerProfile.objects.filter(user=user).first()
    data = {"account": {"id": str(user.pk), "email": user.email, "phone": user.phone, "first_name": user.first_name, "last_name": user.last_name},
        "profile": decrypt(profile.details_encrypted) if profile else {},
        "bookings": list(Booking.objects.filter(customer=user).values("id", "carName", "customerName", "customerEmail", "customerPhone", "pickupDate", "returnDate", "pickupLocation", "returnLocation", "totalDays", "totalAmount", "status", "message")),
        "kyc": [{"booking": str(row.booking_id), "details": decrypt(row.details_encrypted), "status": row.status, "reason": row.reason, "submitted_at": row.submitted_at, "consent_version": row.consent_version} for row in KycCase.objects.filter(customer=user)],
        "documents": list(PrivateDocument.objects.filter(owner=user, erasure__isnull=True).values("id", "kind", "created_at")),
        "payments": list(PaymentAttempt.objects.filter(customer=user).values("reference", "requested_minor", "currency", "created_at", "state__status")),
        "requests": [pack(row) for row in DataRequest.objects.filter(customer=user)],
        "note": "Download document photos from your account. For additional records or copies, submit an access request for owner review; this export excludes credentials and internal security checks."}
    audit(user, "privacy.exported", user)
    response = Response(data)
    response["Cache-Control"] = "private, no-store"
    response["Content-Disposition"] = 'attachment; filename="movara-personal-data.json"'
    return response


@api_view(["GET", "POST"])
@permission_classes([OwnerAccess])
def review(request):
    if request.method == "GET":
        rows = DataRequest.objects.select_related("customer").order_by("-created_at")[:100]
        return Response([dict(pack(row, True), held=DataHold.objects.filter(customer=row.customer).exists()) for row in rows])
    class Input(serializers.Serializer):
        id = serializers.UUIDField()
        action = serializers.ChoiceField(choices=["complete", "decline", "hold", "release_hold"])
        resolution = serializers.CharField(max_length=2000)
    form = Input(data=request.data); form.is_valid(raise_exception=True); values = form.validated_data
    from django.shortcuts import get_object_or_404
    candidate = get_object_or_404(DataRequest, pk=values["id"])
    with transaction.atomic():
        user = get_user_model().objects.select_for_update().get(pk=candidate.customer_id)
        row = DataRequest.objects.select_for_update().get(pk=candidate.pk)
        action = values["action"]
        if action == "hold":
            DataHold.objects.update_or_create(customer=user, defaults={"reason_encrypted": encrypt(values["resolution"]), "actor": request.user})
        elif action == "release_hold":
            DataHold.objects.filter(customer=user).delete()
        else:
            if row.status != "pending":
                raise serializers.ValidationError("This request has already been reviewed.")
            if action == "complete" and row.kind == "deletion":
                erase_operational(user, request.user, deactivate=True)
                row.status = "completed_with_retention"
                row.resolution = RETAINED
            else:
                row.status = "completed" if action == "complete" else "declined"
                row.resolution = values["resolution"]
            row.details_encrypted = ""; row.reviewer = request.user; row.resolved_at = timezone.now(); row.save()
            if user.is_active:
                Notification.objects.create(user=user, message=f"Your {row.kind} request: {row.status}. {row.resolution}")
        audit(request.user, "privacy."+action, row)
    return Response(pack(row))
