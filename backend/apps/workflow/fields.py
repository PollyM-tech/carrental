"""Encrypted database fields; email uses deterministic AEAD for unique login lookups."""
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESSIV
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
from django.conf import settings
from django.db import models
from .security import cipher


def email_cipher():
    key = base64.urlsafe_b64decode(settings.DATA_ENCRYPTION_KEY)
    derived = HKDF(algorithm=hashes.SHA256(), length=64, salt=None, info=b"movara-email-index-v1").derive(key)
    return AESSIV(derived)


class EncryptedEmailField(models.EmailField):
    def __init__(self, *args, **kwargs):
        kwargs["max_length"] = 1024
        super().__init__(*args, **kwargs)

    def from_db_value(self, value, expression, connection):
        if value and value.startswith("email:v1:"):
            return email_cipher().decrypt(base64.urlsafe_b64decode(value[9:]), [b"movara-email"]).decode()
        return value

    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        if not value:
            return value
        return "email:v1:" + base64.urlsafe_b64encode(email_cipher().encrypt(value.strip().lower().encode(), [b"movara-email"])).decode()


class EncryptedTextField(models.TextField):
    def from_db_value(self, value, expression, connection):
        if value and value.startswith("private:v1:"):
            return cipher().decrypt(value[11:].encode()).decode()
        return value

    def get_prep_value(self, value):
        value = super().get_prep_value(value)
        return "private:v1:" + cipher().encrypt(value.encode()).decode() if value else value
