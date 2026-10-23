from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from .cloudinary import CloudinaryConfigurationError, CloudinaryUploadError, upload_vehicle_image
from apps.workflow.permissions import FleetAccess, StaffAccess, OwnerAccess, BookingAccess, has_role
from apps.workflow.services import audit
from .models import Booking, BusinessSettings, Car, CarImage
from .serializers import BookingSerializer, CarSerializer, SettingsSerializer


class StaffLoginThrottle(AnonRateThrottle):
    rate = "10/minute"


@api_view(["GET", "POST"])
@permission_classes([StaffAccess])
def cars(request, action=None):
    if request.method == "GET" and action is None:
        return Response(CarSerializer(Car.objects.filter(deletedAt=None).select_related("image"), many=True, context={"request": request}).data)
    if request.method != "POST" or action not in ["create", "update", "delete"]:
        return Response(status=405)
    if not has_role(request.user, "fleet_manager"):
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied("Fleet manager access is required.")
    with transaction.atomic():
        car = None if action == "create" else get_object_or_404(Car.objects.select_for_update(), pk=serializers.UUIDField().run_validation(request.data.get("id")), deletedAt=None)
        if action == "delete":
            if car.booking_set.filter(status__in=["draft", "kyc_submitted", "kyc_in_review", "kyc_needs_correction", "kyc_approved", "awaiting_payment", "payment_pending_verification", "confirmed", "handover_in_progress", "active", "returned"]).exists():
                raise serializers.ValidationError("Cancel or finish this vehicle's bookings first.")
            car.deletedAt = timezone.now()
            car.isFeatured = False
            car.status = "unavailable"
            car.save()
        else:
            data = {k: v for k, v in request.data.items() if k != "id"}
            serializer = CarSerializer(car, data=data, partial=car is not None, context={"request": request})
            serializer.is_valid(raise_exception=True)
            car = serializer.save()
        audit(request.user, "fleet." + action, car)
    return Response(str(car.pk))


@api_view(["GET"])
@permission_classes([BookingAccess])
def bookings(request, action=None):
    queryset = Booking.objects.select_related("car__image")
    if action == "detail":
        result = get_object_or_404(queryset, pk=serializers.UUIDField().run_validation(request.query_params.get("bookingId")))
        data = BookingSerializer(result, context={"request": request}).data
        data["history"] = list(result.history.values("previous", "current", "reason", "created_at"))
        return Response(data)
    if request.query_params.get("status"):
        queryset = queryset.filter(status=request.query_params["status"])
    return Response(BookingSerializer(queryset, many=True, context={"request": request}).data)


@api_view(["POST"])
@permission_classes([BookingAccess])
def booking_action(request, action):
    return Response({"detail": "Booking confirmation requires verified payment; release requires the handover checks. These actions are disabled until those modules are implemented."}, status=409)



@api_view(["GET", "POST"])
@permission_classes([OwnerAccess])
def settings(request, action=None):
    obj = BusinessSettings.objects.filter(singleton=1).first()
    if request.method == "GET":
        return Response(SettingsSerializer(obj).data if obj else None)
    serializer = SettingsSerializer(obj, data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        obj = serializer.save()
        audit(request.user, "settings.updated", obj)
    return Response(str(obj.pk))


@api_view(["POST"])
@permission_classes([FleetAccess])
def images(request):
    upload = request.FILES.get("image")
    if not upload or upload.size > 5 * 1024 * 1024:
        raise serializers.ValidationError("Choose an image smaller than 5MB.")
    header = upload.read(32)
    upload.seek(0)
    if header.startswith(b"\xff\xd8\xff"):
        extension = "jpg"
    elif header.startswith(b"\x89PNG\r\n\x1a\n"):
        extension = "png"
    elif header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        extension = "webp"
    else:
        raise serializers.ValidationError("Choose a JPEG, PNG, or WebP image.")
    try:
        result = upload_vehicle_image(upload, extension)
    except CloudinaryConfigurationError:
        return Response({"detail": "Image storage is not configured. Contact the administrator."}, status=503)
    except CloudinaryUploadError:
        return Response({"detail": "Image upload failed. Please try again."}, status=502)
    with transaction.atomic():
        obj = CarImage.objects.create(cloudinaryPublicId=result["public_id"], secureUrl=result["secure_url"])
        audit(request.user, "fleet.image_uploaded", obj)
    return Response({"storageId": str(obj.pk)}, status=201)


@api_view(["GET"])
@permission_classes([StaffAccess])
def stats(request):
    bookings = Booking.objects.all()
    cars = Car.objects.filter(deletedAt=None)
    now = timezone.localtime()
    result = {"totalBookings": bookings.count(), "totalCars": cars.count(), "featuredCars": cars.filter(isFeatured=True).count()}
    for status in ["draft", "confirmed", "active", "closed", "cancelled"]:
        result[f"{status}Bookings"] = bookings.filter(status=status).count()
    for status in ["available", "booked", "maintenance", "unavailable"]:
        result[f"{status}Cars"] = cars.filter(status=status).count()
    result["revenueThisMonth"] = bookings.filter(status="closed", completedAt__year=now.year, completedAt__month=now.month).aggregate(total=Sum("totalAmount"))["total"] or 0
    result["pendingBookings"] = result.get("draftBookings", 0)
    result["completedBookings"] = result.get("closedBookings", 0)
    return Response(result)
