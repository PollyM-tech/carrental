"""Regular WhatsApp verification: staff checks the actual sender and reference."""
import secrets
from datetime import timedelta
from urllib.parse import urlencode
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import PhoneChallenge, CustomerProfile
from .permissions import KycAccess
from .security import fingerprint
from .services import audit


def start(user, phone):
    reference = secrets.token_hex(6).upper()
    with transaction.atomic():
        user = get_user_model().objects.select_for_update().get(pk=user.pk)
        PhoneChallenge.objects.filter(user=user, consumed=False).update(consumed=True)
        user.phone = phone
        user.save(update_fields=["phone"])
        CustomerProfile.objects.filter(user=user).update(phone_verified_at=None, verified_phone_hash="")
        challenge = PhoneChallenge.objects.create(user=user, method="manual_whatsapp", code_hash=make_password(reference),
            phone_hash=fingerprint(phone), expires_at=timezone.now()+timedelta(minutes=30))
        audit(user, "phone.manual_requested", challenge)
    text = f"Hello Movara, please verify my WhatsApp number. My reference is {reference}."
    return {"method": "manual_whatsapp", "reference": reference, "expires_at": challenge.expires_at,
        "whatsapp_url": f"https://wa.me/{settings.BUSINESS_WHATSAPP_NUMBER}?{urlencode({'text': text})}",
        "message": "Send this reference from the WhatsApp number you entered. Staff will check the sender and reference. Opening WhatsApp does not verify your phone."}


@api_view(["GET", "POST"])
@permission_classes([KycAccess])
def queue(request):
    if request.method == "GET":
        rows = PhoneChallenge.objects.filter(method="manual_whatsapp", consumed=False, expires_at__gt=timezone.now()).select_related("user")
        return Response([{"id": row.pk, "customer": row.user.email, "phone": row.user.phone, "expires_at": row.expires_at} for row in rows[:100]])
    class Input(serializers.Serializer):
        id = serializers.IntegerField()
        reference = serializers.RegexField(r"^[A-Fa-f0-9]{12}$")
        checked_sender = serializers.BooleanField()
    form = Input(data=request.data); form.is_valid(raise_exception=True)
    values = form.validated_data
    if not values["checked_sender"]:
        raise serializers.ValidationError("Check the message sender's full phone number in WhatsApp first.")
    valid = False
    with transaction.atomic():
        # Same lock order as new requests: user then challenge.
        candidate = PhoneChallenge.objects.filter(pk=values["id"], method="manual_whatsapp").first()
        if not candidate:
            raise serializers.ValidationError("Verification request not found.")
        user = get_user_model().objects.select_for_update().get(pk=candidate.user_id)
        obj = PhoneChallenge.objects.select_for_update().get(pk=candidate.pk)
        if not obj.consumed and obj.expires_at > timezone.now() and obj.attempts < 5 and obj.phone_hash == fingerprint(user.phone) and user.is_active:
            obj.attempts += 1
            valid = check_password(values["reference"].upper(), obj.code_hash)
            obj.consumed = valid or obj.attempts >= 5
            obj.save()
            if valid:
                profile, _ = CustomerProfile.objects.get_or_create(user=user)
                profile.phone_verified_at = timezone.now(); profile.verified_phone_hash = obj.phone_hash; profile.save()
                audit(request.user, "phone.manually_verified", obj, "Staff checked the WhatsApp sender and reference")
    if not valid:
        raise serializers.ValidationError("Reference is invalid, expired, used, or belongs to an older phone number.")
    return Response({"verified": True})
