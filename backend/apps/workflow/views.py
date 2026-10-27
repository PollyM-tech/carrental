import hashlib
import re
import secrets
from datetime import date, timedelta
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageStat, ImageFilter, UnidentifiedImageError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.contrib.auth.models import Group
from django.core import signing
from django.db import IntegrityError, transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle

from apps.rentals.models import Booking, Car
from apps.rentals.serializers import CarSerializer, BookingSerializer
from .models import AuditEvent, BookingHistory, CustomerProfile, PhoneChallenge, PrivateDocument, KycCase, KycDecision, Policy, VehicleDocument, VehicleBlock, Notification
from .permissions import FleetAccess, KycAccess, OwnerAccess, StaffAccess, has_role, ROLES
from .security import cipher, encrypt, decrypt, fingerprint
from .services import audit, transition, vehicle_available, date_range, staffed_due, expire_holds
from .phone_numbers import normalise_phone
from .whatsapp import send_code, DeliveryUnavailable


class OtpThrottle(UserRateThrottle):
    rate = "6/hour"


def owned_booking(user, pk):
    return get_object_or_404(Booking, pk=pk, customer=user)


def profile_data(user):
    profile, _ = CustomerProfile.objects.get_or_create(user=user)
    data = decrypt(profile.details_encrypted)
    return {"details": data, "phone_verified": bool(profile.phone_verified_at and profile.verified_phone_hash == fingerprint(user.phone)), "blocked": profile.blocked}


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def profile(request):
    get_user_model().objects.select_for_update().get(pk=request.user.pk, is_active=True)
    if request.method == "GET":
        return Response(profile_data(request.user))
    approved = Policy.objects.filter(pk=1).first()
    if not approved or not approved.privacy_notice_version or not approved.privacy_notice_text or not approved.retention_days:
        raise serializers.ValidationError("Identity collection awaits an approved privacy notice and retention policy.")
    fields = ["full_name", "id_number", "date_of_birth", "licence_number", "licence_class", "licence_issued", "licence_expiry", "address", "next_of_kin_name", "next_of_kin_phone", "destination", "cross_border", "guarantor_name", "guarantor_phone", "id_expiry"]
    details = {key: request.data.get(key, "") for key in fields}
    if type(details["cross_border"]) is not bool:
        raise serializers.ValidationError("Cross-border travel must be true or false.")
    if details["cross_border"]:
        raise serializers.ValidationError("Cross-border travel is not available.")
    for key in ["guarantor_name", "guarantor_phone"]:
        if not isinstance(details[key], str) or len(details[key]) > 255:
            raise serializers.ValidationError("Guarantor details must be text up to 255 characters.")
    if details["id_expiry"]:
        details["id_expiry"] = serializers.DateField().run_validation(details["id_expiry"]).isoformat()
    for key in ["date_of_birth", "licence_issued", "licence_expiry"]:
        try:
            details[key] = date.fromisoformat(details[key]).isoformat()
        except (ValueError, TypeError):
            raise serializers.ValidationError({key: "A valid date is required."})
    for key in ["full_name", "id_number", "licence_number", "licence_class", "address", "next_of_kin_name", "next_of_kin_phone", "destination"]:
        if not isinstance(details[key], str) or not details[key].strip() or len(details[key]) > 2000:
            raise serializers.ValidationError({key: "This field is required."})
        details[key] = details[key].strip()
    if not re.fullmatch(r"[A-Za-z0-9-]{5,30}", details["id_number"]) or not re.fullmatch(r"[A-Za-z0-9/-]{5,30}", details["licence_number"]):
        raise serializers.ValidationError("Check the ID/passport and licence number formats.")
    if date.fromisoformat(details["date_of_birth"]) >= timezone.localdate() or date.fromisoformat(details["licence_issued"]) > timezone.localdate():
        raise serializers.ValidationError("Check birth and licence issue dates.")
    with transaction.atomic():
        obj, _ = CustomerProfile.objects.select_for_update().get_or_create(user=request.user)
        obj.details_encrypted = encrypt(details)
        obj.id_hash = fingerprint(details["id_number"])
        obj.licence_hash = fingerprint(details["licence_number"])
        obj.save()
        audit(request.user, "customer.profile_updated", obj)
    return Response(profile_data(request.user))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([OtpThrottle])
def phone_request(request):
    try:
        phone = normalise_phone(request.data.get("phone", ""))
    except ValueError as error:
        raise serializers.ValidationError(str(error)) from None
    if settings.OTP_BACKEND == "manual_whatsapp":
        from .manual_phone import start
        return Response(start(request.user, phone))
    code = f"{secrets.randbelow(1000000):06d}"
    if settings.OTP_BACKEND != "development" or not settings.DEBUG:
        try:
            send_code(phone, code)
        except DeliveryUnavailable as error:
            return Response({"detail": str(error)}, status=503)
    with transaction.atomic():
        get_user_model().objects.select_for_update().get(pk=request.user.pk)
        PhoneChallenge.objects.filter(user=request.user, consumed=False).update(consumed=True)
        request.user.phone = phone
        request.user.save(update_fields=["phone"])
        PhoneChallenge.objects.create(user=request.user, code_hash=make_password(code), phone_hash=fingerprint(phone), expires_at=timezone.now()+timedelta(minutes=5))
        audit(request.user, "phone.code_requested", request.user)
    result = {"message": "Verification code sent to WhatsApp."}
    if settings.OTP_BACKEND == "development" and settings.DEBUG:
        result = {"message": "Development verification only; no WhatsApp message was sent.", "development_code": code}
    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([OtpThrottle])
def phone_verify(request):
    valid = False
    with transaction.atomic():
        obj = PhoneChallenge.objects.select_for_update().filter(user=request.user, consumed=False, method="otp").order_by("-created_at").first()
        if obj and obj.attempts < 5 and obj.expires_at > timezone.now() and obj.phone_hash == fingerprint(request.user.phone):
            obj.attempts += 1
            valid = check_password(str(request.data.get("code", "")), obj.code_hash)
            obj.consumed = valid or obj.attempts >= 5
            obj.save()
            if valid:
                p, _ = CustomerProfile.objects.get_or_create(user=request.user)
                p.phone_verified_at = timezone.now()
                p.verified_phone_hash = obj.phone_hash
                p.save()
                audit(request.user, "phone.verified", p)
    if not valid:
        raise serializers.ValidationError("Invalid or expired code.")
    return Response({"verified": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def public_cars(request, pk=None):
    expire_holds()
    cars = Car.objects.filter(deletedAt=None).exclude(plateNumber="").exclude(status__in=["maintenance", "unavailable"]).select_related("image")
    if pk:
        cars = cars.filter(pk=pk)
    if request.query_params.get("pickupDate") or request.query_params.get("returnDate"):
        start, end = date_range(request.query_params)
        cars = [car for car in cars if vehicle_available(car, start, end)]
    else:
        today = timezone.localdate()
        cars = [car for car in cars if all(VehicleDocument.objects.filter(car=car, kind=kind, expires_on__gte=today).exists() for kind in ["insurance", "inspection"])]
    data = CarSerializer(cars, many=True, context={"request": request}).data
    # Never expose registration numbers or internal fleet records publicly.
    fields = ["_id", "name", "category", "pricePerDay", "seats", "transmission", "fuel", "description", "isFeatured", "displayImageUrl", "rating", "reviewCount", "brand", "model", "year", "location"]
    result = [{key: row.get(key) for key in fields} for row in data]
    if pk:
        if not result:
            return Response({"detail": "Vehicle not found."}, status=404)
        return Response(result[0])
    return Response(result)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def customer_bookings(request):
    expire_holds()
    if request.method == "GET":
        return Response(BookingSerializer(Booking.objects.filter(customer=request.user).select_related("car__image"), many=True, context={"request": request}).data)
    customer = request.user
    if request.data.get("customer_email"):
        if not has_role(request.user, "front_desk"):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only front-desk staff can book for another customer.")
        customer = get_object_or_404(get_user_model(), email=request.data["customer_email"], is_active=True, is_staff=False)
    start, end = date_range(request.data)
    with transaction.atomic():
        get_user_model().objects.select_for_update().get(pk=customer.pk, is_active=True)
        car = get_object_or_404(Car.objects.select_for_update(), pk=serializers.UUIDField().run_validation(request.data.get("carId")), deletedAt=None)
        if not vehicle_available(car, start, end):
            raise serializers.ValidationError("This vehicle is not available for the selected dates.")
        obj = Booking.objects.create(customer=customer, car=car, carName=car.name, customerName=customer.get_full_name() or customer.email, customerEmail=customer.email, customerPhone=customer.phone, pickupDate=start, returnDate=end, totalDays=(end-start).days, totalAmount=(end-start).days*car.pricePerDay, pickupLocation=str(request.data.get("pickupLocation", "Nairobi"))[:200], returnLocation=str(request.data.get("returnLocation", "Nairobi"))[:200])
        BookingHistory.objects.create(booking=obj, current="draft", actor=request.user)
        audit(request.user, "booking.created", obj)
    return Response(BookingSerializer(obj, context={"request": request}).data, status=201)


def case_payload(case):
    return {"id": str(case.pk), "booking": str(case.booking_id), "customer": case.customer.email, "status": case.status,
        "submitted_at": case.submitted_at, "due_at": case.due_at, "missed": case.missed, "reason": case.reason,
        "details": decrypt(case.details_encrypted), "document_ids": case.document_ids, "checks": case.checks,
        "consent_version": case.consent_version, "consent_at": case.consent_at,
        "decisions": list(case.decisions.values("decision", "reason", "checks", "created_at"))}


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def booking_progress(request, pk):
    booking = owned_booking(request.user, pk)
    case = KycCase.objects.filter(booking=booking).first()
    return Response({"booking": BookingSerializer(booking, context={"request": request}).data,
        "documents": list(PrivateDocument.objects.filter(booking=booking, erasure__isnull=True).values("id", "kind", "created_at")),
        "kyc": case_payload(case) if case else None,
        "history": list(booking.history.values("previous", "current", "reason", "created_at"))})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def private_upload(request, pk):
    get_user_model().objects.select_for_update().get(pk=request.user.pk, is_active=True)
    booking = owned_booking(request.user, pk)
    if booking.status not in ["draft", "kyc_needs_correction"]:
        raise serializers.ValidationError("Documents can only be added to a draft or correction request.")
    policy = Policy.objects.filter(pk=1).first()
    if not policy or not policy.privacy_notice_version or not policy.privacy_notice_text or not policy.retention_days:
        raise serializers.ValidationError("Document collection awaits an approved privacy notice and retention policy.")
    if request.data.get("consent") not in [True, "true"] or request.data.get("consent_version") != policy.privacy_notice_version:
        raise serializers.ValidationError("Consent to the current privacy notice is required before uploading documents.")
    kind = request.data.get("kind")
    if kind not in dict(PrivateDocument._meta.get_field("kind").choices):
        raise serializers.ValidationError("Choose a document type.")
    file = request.FILES.get("image")
    if not file or file.size > 5*1024*1024:
        raise serializers.ValidationError("Choose a document photo smaller than 5MB.")
    try:
        raw = file.read()
        image = Image.open(BytesIO(raw))
        if image.format not in ["JPEG", "PNG", "WEBP"] or min(image.size) < 400 or image.width*image.height > 25_000_000:
            raise serializers.ValidationError("Upload a clear JPEG, PNG or WebP document photo at least 400 pixels on each side.")
        image.load()
        thumb = image.convert("L").resize((400, 250))
        if ImageStat.Stat(thumb).stddev[0] < 10 or ImageStat.Stat(thumb.filter(ImageFilter.FIND_EDGES)).var[0] < 50:
            raise serializers.ValidationError("The image appears blank or blurred. Retake the document photo.")
        image.thumbnail((2000, 2000))
        out = BytesIO()
        image.convert("RGB").save(out, "JPEG", quality=85)
        content = out.getvalue()
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise serializers.ValidationError("The image could not be read. Upload a fresh photo.")
    obj = PrivateDocument(booking=booking, owner=request.user, kind=kind, content_type="image/jpeg", size=len(content), checksum=hashlib.sha256(content).hexdigest(), device=request.headers.get("User-Agent", "")[:255])
    obj.storage_name = str(obj.pk) + ".enc"
    root = Path(settings.PRIVATE_DOCUMENT_ROOT)
    root.mkdir(parents=True, exist_ok=True, mode=0o700)
    path = root / obj.storage_name
    try:
        with path.open("xb") as output:
            output.write(cipher().encrypt(content))
        path.chmod(0o600)
        with transaction.atomic():
            obj.save()
            audit(request.user, "document.uploaded", obj, "Privacy notice: " + policy.privacy_notice_version)
    except Exception:
        path.unlink(missing_ok=True)
        raise
    return Response({"id": str(obj.pk), "kind": kind}, status=201)


def permitted_document(user, pk):
    document = get_object_or_404(PrivateDocument, pk=pk, erasure__isnull=True)
    if document.owner_id != user.pk and not has_role(user, "kyc_reviewer"):
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied()
    return document


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def document_link(request, pk):
    obj = permitted_document(request.user, pk)
    token = signing.dumps({"document": str(obj.pk), "user": str(request.user.pk)}, salt="document-link")
    audit(request.user, "document.link_created", obj)
    return Response({"url": request.build_absolute_uri(f"/api/v1/workflow/documents/{obj.pk}/content/?token={token}")})


@api_view(["GET"])
@permission_classes([AllowAny])
def document_content(request, pk):
    try:
        token = signing.loads(request.query_params.get("token", ""), salt="document-link", max_age=60)
        user = get_user_model().objects.get(pk=token["user"], is_active=True)
        if token["document"] != str(pk):
            raise signing.BadSignature()
    except (signing.BadSignature, get_user_model().DoesNotExist, KeyError):
        return Response({"detail": "This document link expired."}, status=403)
    obj = permitted_document(user, pk)
    audit(user, "document.viewed", obj)
    try:
        content = cipher().decrypt((Path(settings.PRIVATE_DOCUMENT_ROOT)/obj.storage_name).read_bytes())
    except FileNotFoundError:
        return Response({"detail": "This document is no longer available."}, status=410)
    response = HttpResponse(content, content_type=obj.content_type)
    response["Cache-Control"] = "private, no-store"
    response["Content-Disposition"] = 'inline; filename="document.jpg"'
    response["X-Content-Type-Options"] = "nosniff"
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def public_policy(request):
    p = Policy.objects.filter(pk=1).first()
    return Response({"privacy_notice_version": p.privacy_notice_version if p else "", "privacy_notice_text": p.privacy_notice_text if p else "", "retention_days": p.retention_days if p else None, "staffed_hours_configured": bool(p and p.staffed_start and p.staffed_end and p.staffed_weekdays), "message": "KYC review target: 30 minutes, before vehicle handover."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def submit_kyc(request, pk):
    get_user_model().objects.select_for_update().get(pk=request.user.pk, is_active=True)
    expire_holds()
    with transaction.atomic():
        booking = owned_booking(request.user, pk)
        car = Car.objects.select_for_update().get(pk=booking.car_id)
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.status not in ["draft", "kyc_needs_correction"]:
            raise serializers.ValidationError("This booking cannot be submitted for review now.")
        p = Policy.objects.filter(pk=1).first()
        if not p or not p.privacy_notice_version or not p.privacy_notice_text or not p.retention_days:
            raise serializers.ValidationError("Document consent and retention configuration are awaiting approval.")
        if request.data.get("consent") is not True or request.data.get("consent_version") != p.privacy_notice_version:
            raise serializers.ValidationError("Consent to the current privacy notice is required.")
        customer = get_object_or_404(CustomerProfile, user=request.user)
        details = decrypt(customer.details_encrypted)
        if customer.blocked or not customer.phone_verified_at or customer.verified_phone_hash != fingerprint(request.user.phone):
            raise serializers.ValidationError("Verify your phone before submitting. Blocked accounts cannot proceed.")
        if not details or date.fromisoformat(details["licence_expiry"]) < booking.returnDate or (details.get("id_expiry") and date.fromisoformat(details["id_expiry"]) < booking.returnDate):
            raise serializers.ValidationError("Your licence must remain valid for the full rental.")
        if CustomerProfile.objects.exclude(user=request.user).filter(id_hash=customer.id_hash).exists() or CustomerProfile.objects.exclude(user=request.user).filter(licence_hash=customer.licence_hash).exists():
            raise serializers.ValidationError("These documents need staff assistance because they match another account.")
        if not vehicle_available(car, booking.pickupDate, booking.returnDate, booking.pk):
            raise serializers.ValidationError("The selected vehicle is no longer available for those dates.")
        documents = []
        for kind in ["id_front", "id_back", "licence_front", "licence_back"]:
            obj = PrivateDocument.objects.filter(booking=booking, owner=request.user, kind=kind, erasure__isnull=True).order_by("-created_at").first()
            if not obj:
                raise serializers.ValidationError(f"Upload {kind.replace('_', ' ')}.")
            documents.append(str(obj.pk))
        case = KycCase.objects.select_for_update().filter(booking=booking).first()
        now = timezone.now()
        if not case:
            case = KycCase(booking=booking, customer=request.user, submitted_at=now, due_at=staffed_due(now))
        case.status = "submitted"
        case.details_encrypted = encrypt(details)
        case.document_ids = documents
        case.consent_version = p.privacy_notice_version
        case.consent_at = now
        case.save()
        transition(booking, "kyc_submitted", request.user)
        audit(request.user, "kyc.submitted", case)
    return Response(case_payload(case))


@api_view(["GET", "POST"])
@permission_classes([KycAccess])
def review_queue(request, pk=None):
    if request.method == "GET":
        queryset = KycCase.objects.select_related("customer", "booking").order_by("submitted_at")
        if pk:
            case = get_object_or_404(queryset, pk=pk)
            audit(request.user, "kyc.viewed", case)
            return Response(case_payload(case))
        return Response([{"id": str(c.pk), "booking": str(c.booking_id), "customer": c.customer.email, "status": c.status, "due_at": c.due_at, "submitted_at": c.submitted_at, "reason": c.reason} for c in queryset])
    decision = request.data.get("decision")
    reason = str(request.data.get("reason", "")).strip()
    if decision not in ["start", "approve", "correction", "reject"]:
        raise serializers.ValidationError("Choose a valid review action.")
    try:
        with transaction.atomic():
            initial = get_object_or_404(KycCase, pk=pk)
            car = Car.objects.select_for_update().get(pk=initial.booking.car_id)
            booking = Booking.objects.select_for_update().get(pk=initial.booking_id)
            case = KycCase.objects.select_for_update().get(pk=pk)
            if case.customer_id == request.user.pk:
                raise serializers.ValidationError("You cannot review your own documents.")
            if decision == "start":
                if case.status != "submitted":
                    raise serializers.ValidationError("This case is not waiting for review.")
                transition(booking, "kyc_in_review", request.user)
                case.status = "in_review"
                case.reviewer = request.user
                case.save()
                audit(request.user, "kyc.review_started", case)
                return Response(case_payload(case))
            if case.status != "in_review" or case.reviewer_id != request.user.pk:
                raise serializers.ValidationError("Start this review before recording a decision.")
            if decision in ["reject", "correction"] and not reason:
                raise serializers.ValidationError("Explain the rejection or corrections needed.")
            checks = request.data.get("checks", {})
            if decision == "approve":
                policy = Policy.objects.filter(pk=1).first()
                if not policy or policy.minimum_age is None or policy.minimum_licence_months is None:
                    raise serializers.ValidationError("Driver eligibility rules must be configured before KYC approval.")
                details = decrypt(case.details_encrypted)
                born = date.fromisoformat(details["date_of_birth"])
                issued = date.fromisoformat(details["licence_issued"])
                at = booking.pickupDate
                age = at.year-born.year-((at.month, at.day)<(born.month, born.day))
                months = (at.year-issued.year)*12+at.month-issued.month-(at.day<issued.day)
                rule = policy.category_rules.get(car.category, {})
                if not all(details.get(k, "").strip() for k in ["guarantor_name", "guarantor_phone", "next_of_kin_name", "next_of_kin_phone"]):
                    raise serializers.ValidationError("Request the required guarantor details before approval.")
                if age < rule.get("minimum_age", policy.minimum_age) or months < rule.get("minimum_licence_months", policy.minimum_licence_months):
                    raise serializers.ValidationError("The customer does not meet the approved driver rules.")
                if details.get("cross_border"):
                    raise serializers.ValidationError("Cross-border travel is not available.")
                if not isinstance(checks, dict) or not all(checks.get(key) is True for key in ["details_match", "documents_genuine", "ntsa_checked", "correct_class"]):
                    raise serializers.ValidationError("Record all document and NTSA checks before approval.")
                profile = CustomerProfile.objects.get(user=case.customer)
                if decrypt(profile.details_encrypted) != details or profile.blocked or profile.id_hash != fingerprint(details["id_number"]) or profile.licence_hash != fingerprint(details["licence_number"]) or not profile.phone_verified_at or profile.verified_phone_hash != fingerprint(case.customer.phone):
                    raise serializers.ValidationError("Customer details changed or account is blocked. Request a correction.")
                if CustomerProfile.objects.exclude(user=case.customer).filter(id_hash=profile.id_hash).exists() or CustomerProfile.objects.exclude(user=case.customer).filter(licence_hash=profile.licence_hash).exists():
                    raise serializers.ValidationError("Duplicate identity or licence requires staff assistance.")
                if date.fromisoformat(details["licence_expiry"]) < booking.returnDate or (details.get("id_expiry") and date.fromisoformat(details["id_expiry"]) < booking.returnDate) or not vehicle_available(car, booking.pickupDate, booking.returnDate, booking.pk):
                    raise serializers.ValidationError("Licence validity or vehicle availability has changed.")
                booking.hold_expires_at = timezone.now()+timedelta(minutes=settings.PAYMENT_HOLD_MINUTES)
                transition(booking, "kyc_approved", request.user)
                transition(booking, "awaiting_payment", request.user)
                case.approved_at = timezone.now()
            else:
                transition(booking, "kyc_needs_correction" if decision == "correction" else "kyc_rejected", request.user, reason)
            case.status = {"approve": "approved", "correction": "needs_correction", "reject": "rejected"}[decision]
            case.reason = reason
            case.checks = checks
            case.save()
            KycDecision.objects.create(case=case, reviewer=request.user, decision=decision, reason=reason, checks=checks)
            audit(request.user, "kyc."+decision, case, reason)
            Notification.objects.create(user=case.customer, message=f"Document review: {case.status.replace('_', ' ')}. {reason}")
    except IntegrityError:
        raise serializers.ValidationError("This vehicle was reserved by another booking. Choose another vehicle.")
    return Response(case_payload(case))


@api_view(["GET", "POST"])
@permission_classes([FleetAccess])
def fleet_compliance(request, pk):
    car = get_object_or_404(Car, pk=pk, deletedAt=None)
    if request.method == "GET":
        return Response({"documents": list(car.documents.values()), "blocks": list(car.blocks.values())})
    with transaction.atomic():
        Car.objects.select_for_update().get(pk=pk)
        if request.data.get("type") == "document":
            kind = request.data.get("kind")
            if kind not in ["insurance", "inspection"]:
                raise serializers.ValidationError("Choose insurance or inspection.")
            expires = serializers.DateField().run_validation(request.data.get("expires_on"))
            reference = str(request.data.get("reference", "")).strip()
            if not reference:
                raise serializers.ValidationError("A document reference is required.")
            obj = VehicleDocument.objects.create(car=car, kind=kind, reference=reference[:100], expires_on=expires)
        elif request.data.get("type") == "block":
            start, end = date_range({"pickupDate": request.data.get("starts_on"), "returnDate": request.data.get("ends_on")})
            if car.booking_set.filter(status__in=["kyc_approved", "awaiting_payment", "payment_pending_verification", "confirmed", "handover_in_progress", "active", "returned"], pickupDate__lt=end, returnDate__gt=start).exists():
                raise serializers.ValidationError("Resolve conflicting bookings before scheduling maintenance.")
            reason = str(request.data.get("reason", "")).strip()
            if not reason:
                raise serializers.ValidationError("Explain the service or repair block.")
            obj = VehicleBlock.objects.create(car=car, starts_on=start, ends_on=end, reason=reason[:255])
        else:
            raise serializers.ValidationError("Choose a document or maintenance block.")
        audit(request.user, "fleet.compliance_added", obj)
    return Response({"id": obj.pk}, status=201)


class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = "__all__"
        read_only_fields = ["id"]

    def validate(self, attrs):
        start, end = attrs.get("staffed_start"), attrs.get("staffed_end")
        days = attrs.get("staffed_weekdays", [])
        if (start is None) != (end is None) or (start and end <= start):
            raise serializers.ValidationError("Staffed end must be later than start on the same day.")
        if not isinstance(days, list) or any(type(d) is not int or d < 0 or d > 6 for d in days):
            raise serializers.ValidationError("Staffed weekdays must be integers 0 (Monday) to 6 (Sunday).")
        rules = attrs.get("category_rules", {})
        if not isinstance(rules, dict):
            raise serializers.ValidationError("Category rules must be an object keyed by vehicle category.")
        for category, rule in rules.items():
            if not isinstance(rule, dict) or type(rule.get("guarantor_required")) is not bool:
                raise serializers.ValidationError("Each category needs an explicit guarantor_required true/false decision.")
            for key in ["minimum_age", "minimum_licence_months"]:
                if key in rule and (type(rule[key]) is not int or rule[key] < 0):
                    raise serializers.ValidationError("Category driver rules must be non-negative integers.")
        return attrs


@api_view(["GET", "POST"])
@permission_classes([OwnerAccess])
def policies(request):
    obj = Policy.objects.filter(pk=1).first()
    if request.method == "GET":
        return Response(PolicySerializer(obj).data if obj else {})
    if not str(request.data.get("reason", "")).strip():
        raise serializers.ValidationError("Record the policy approval reference or reason.")
    serializer = PolicySerializer(obj, data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        obj = serializer.save(id=1)
        audit(request.user, "policy.updated", obj, str(request.data.get("reason", "")))
    return Response(serializer.data)


@api_view(["GET", "POST"])
@permission_classes([OwnerAccess])
def staff_users(request):
    users = get_user_model().objects.filter(is_staff=True)
    if request.method == "GET":
        return Response([{"id": str(u.pk), "email": u.email, "active": u.is_active, "roles": list(u.groups.values_list("name", flat=True)), "owner": u.is_superuser or u.role == "admin"} for u in users])
    obj = get_object_or_404(get_user_model(), email=request.data.get("email")) if request.data.get("email") else get_object_or_404(get_user_model(), pk=serializers.UUIDField().run_validation(request.data.get("user_id")))
    roles = request.data.get("roles", [])
    if not isinstance(roles, list) or any(r not in ROLES for r in roles):
        raise serializers.ValidationError("Choose valid roles.")
    if obj.pk == request.user.pk or obj.is_superuser:
        raise serializers.ValidationError("Use Django administration to change owner access.")
    with transaction.atomic():
        obj.groups.set([Group.objects.get_or_create(name=role)[0] for role in roles])
        obj.is_staff = bool(roles)
        obj.role = "staff" if roles else "customer"
        obj.save()
        audit(request.user, "staff.roles_updated", obj, ",".join(roles))
    return Response({"saved": True})


@api_view(["GET"])
@permission_classes([OwnerAccess])
def audit_events(request):
    return Response(list(AuditEvent.objects.select_related("actor").values("id", "actor__email", "action", "entity", "entity_id", "reason", "created_at")[:200]))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications(request):
    return Response(list(Notification.objects.filter(user=request.user).order_by("-created_at").values("id", "message", "created_at", "read_at")[:100]))


@api_view(["POST"])
@permission_classes([KycAccess])
def block_customer(request, pk):
    user = get_object_or_404(get_user_model(), pk=pk)
    reason = str(request.data.get("reason", "")).strip()
    if not reason:
        raise serializers.ValidationError("A blocklist reason is required.")
    with transaction.atomic():
        obj, _ = CustomerProfile.objects.get_or_create(user=user)
        obj.blocked = request.data.get("blocked") is True
        obj.block_reason = reason
        obj.save()
        audit(request.user, "customer.blocklist_changed", obj, reason)
    return Response({"blocked": obj.blocked})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def access(request):
    return Response({"staff": request.user.is_staff, "owner": request.user.is_superuser or request.user.role == "admin", "roles": list(request.user.groups.values_list("name", flat=True)), "user_id": str(request.user.pk)})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def reuse_documents(request, pk):
    get_user_model().objects.select_for_update().get(pk=request.user.pk, is_active=True)
    with transaction.atomic():
        booking = owned_booking(request.user, pk)
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.status != "draft":
            raise serializers.ValidationError("Saved documents can only be reused on a new draft.")
        customer = get_object_or_404(CustomerProfile, user=request.user)
        previous = KycCase.objects.filter(customer=request.user, status="approved").exclude(booking=booking).order_by("-approved_at").first()
        details = decrypt(customer.details_encrypted)
        if not previous or not details or not details.get("licence_expiry") or decrypt(previous.details_encrypted) != details or date.fromisoformat(details["licence_expiry"]) < booking.returnDate or (details.get("id_expiry") and date.fromisoformat(details["id_expiry"]) < booking.returnDate):
            raise serializers.ValidationError("No current matching approved documents are on file. Upload fresh images.")
        sources = list(PrivateDocument.objects.filter(pk__in=previous.document_ids, owner=request.user, erasure__isnull=True))
        if len(sources) != 4 or any(not (Path(settings.PRIVATE_DOCUMENT_ROOT)/source.storage_name).exists() for source in sources):
            raise serializers.ValidationError("Some saved documents are unavailable. Upload fresh images.")
        for source in sources:
            obj = PrivateDocument.objects.create(booking=booking, owner=request.user, kind=source.kind, storage_name=source.storage_name, content_type=source.content_type, checksum=source.checksum, size=source.size, device="Reused from approved case")
            audit(request.user, "document.reused", obj)
    return Response({"message": "Documents copied from your approved case. This booking still requires review."})
