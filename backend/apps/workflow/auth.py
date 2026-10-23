import base64
import hashlib
import hmac
import secrets
import struct
import time
from urllib.parse import quote

from django.contrib.auth import authenticate
from django.core import signing
from django.db import transaction
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

from .models import StaffAuthenticator
from .security import decrypt, encrypt


class CustomerTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_staff:
            raise AuthenticationFailed("Use the staff login with two-factor authentication.")
        return data


class LoginThrottle(AnonRateThrottle):
    rate = "10/minute"


def totp(secret, counter):
    key = base64.b32decode(secret)
    digest = hmac.new(key, struct.pack(">Q", counter), hashlib.sha1).digest()
    offset = digest[-1] & 15
    return f"{(struct.unpack('>I', digest[offset:offset+4])[0] & 0x7fffffff) % 1000000:06d}"


def verify_totp(authenticator, code):
    now = int(time.time()) // 30
    secret = decrypt(authenticator.secret_encrypted)["secret"]
    for counter in [now - 1, now, now + 1]:
        if counter > authenticator.last_counter and hmac.compare_digest(totp(secret, counter), str(code)):
            authenticator.last_counter = counter
            authenticator.enabled = True
            authenticator.save()
            return True
    return False


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def staff_login(request):
    user = authenticate(request, email=request.data.get("email", ""), password=request.data.get("password", ""))
    if not user or not user.is_staff:
        return Response({"detail": "Invalid staff credentials."}, status=401)
    auth, _ = StaffAuthenticator.objects.get_or_create(user=user, defaults={"secret_encrypted": encrypt({"secret": base64.b32encode(secrets.token_bytes(20)).decode()})})
    result = {"challenge": signing.dumps({"user": str(user.pk)}, salt="staff-mfa"), "enrollment_required": not auth.enabled}
    if not auth.enabled:
        secret = decrypt(auth.secret_encrypted)["secret"]
        result["secret"] = secret
        result["uri"] = f"otpauth://totp/{quote('Movara:' + user.email)}?secret={secret}&issuer=Movara"
    return Response(result)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([LoginThrottle])
def staff_verify(request):
    try:
        challenge = signing.loads(request.data.get("challenge", ""), salt="staff-mfa", max_age=300)
    except signing.BadSignature:
        raise serializers.ValidationError("Login challenge expired. Sign in again.")
    with transaction.atomic():
        auth = StaffAuthenticator.objects.select_for_update().select_related("user").filter(user_id=challenge["user"], user__is_active=True, user__is_staff=True).first()
        if not auth or not verify_totp(auth, request.data.get("code", "")):
            raise serializers.ValidationError("Invalid or already used authenticator code.")
        from .services import audit
        audit(auth.user, "staff.login", auth.user)
        refresh = RefreshToken.for_user(auth.user)
        refresh["mfa"] = True
        return Response({"token": str(refresh.access_token), "refresh": str(refresh)})
