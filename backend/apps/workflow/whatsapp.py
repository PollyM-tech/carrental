import json
import re
from urllib.request import Request, urlopen
from urllib.error import URLError
from django.conf import settings


class DeliveryUnavailable(Exception):
    pass


def send_code(phone, code):
    if not all([settings.WHATSAPP_ACCESS_TOKEN, settings.WHATSAPP_PHONE_NUMBER_ID, settings.WHATSAPP_OTP_TEMPLATE]) or not re.fullmatch(r"v\d+\.\d+", settings.WHATSAPP_API_VERSION):
        raise DeliveryUnavailable("WhatsApp verification is not configured yet.")
    payload = {
        "messaging_product": "whatsapp", "to": phone.lstrip("+"), "type": "template",
        "template": {"name": settings.WHATSAPP_OTP_TEMPLATE, "language": {"code": settings.WHATSAPP_TEMPLATE_LANGUAGE}, "components": [
            {"type": "body", "parameters": [{"type": "text", "text": code}]},
            {"type": "button", "sub_type": "url", "index": "0", "parameters": [{"type": "text", "text": code}]},
        ]},
    }
    request = Request(f"https://graph.facebook.com/{settings.WHATSAPP_API_VERSION}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages", data=json.dumps(payload).encode(), headers={"Authorization": "Bearer " + settings.WHATSAPP_ACCESS_TOKEN, "Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(request, timeout=15) as response:
            result = json.load(response)
            if not result.get("messages"):
                raise DeliveryUnavailable("WhatsApp verification could not be sent. Please retry.")
    except (URLError, TimeoutError, OSError, ValueError):
        raise DeliveryUnavailable("WhatsApp verification could not be sent. Please retry.") from None
