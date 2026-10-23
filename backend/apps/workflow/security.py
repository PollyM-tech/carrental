import hashlib
import hmac
import json
from cryptography.fernet import Fernet
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def cipher():
    if not settings.DATA_ENCRYPTION_KEY:
        raise ImproperlyConfigured("DATA_ENCRYPTION_KEY is required for private data.")
    return Fernet(settings.DATA_ENCRYPTION_KEY.encode())


def encrypt(value):
    return cipher().encrypt(json.dumps(value).encode()).decode()


def decrypt(value):
    return json.loads(cipher().decrypt(value.encode())) if value else {}


def fingerprint(value):
    return hmac.new(settings.DATA_ENCRYPTION_KEY.encode(), value.strip().upper().encode(), hashlib.sha256).hexdigest()
