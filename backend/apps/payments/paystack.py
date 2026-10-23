"""Paystack's secret key is used only for authenticated backend requests."""
import json
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlsplit, urlencode
from urllib.request import Request, urlopen
from django.conf import settings


class ProviderUnavailable(Exception):
    pass


class ProviderRejected(Exception):
    pass


def configuration_ready():
    return (settings.DEBUG or settings.PAYSTACK_MODE == "live") and settings.PAYSTACK_MODE in ["test", "live"] and settings.PAYSTACK_SECRET_KEY.startswith("sk_"+settings.PAYSTACK_MODE+"_")


def request(path, data=None, expect_list=False):
    if not configuration_ready():
        raise ProviderUnavailable("Paystack is not configured.")
    req = Request("https://api.paystack.co/"+path, data=json.dumps(data).encode() if data is not None else None,
        headers={"Authorization": "Bearer "+settings.PAYSTACK_SECRET_KEY, "Content-Type": "application/json", "User-Agent": "MovaraCarHire/1.0"}, method="POST" if data is not None else "GET")
    try:
        with urlopen(req, timeout=12) as response:
            result = json.load(response)
        if not isinstance(result, dict) or result.get("status") is not True or not isinstance(result.get("data"), list if expect_list else dict):
            raise ProviderRejected("Paystack did not accept the request.")
        return result["data"]
    except HTTPError as error:
        if 400 <= error.code < 500 and error.code != 429:
            raise ProviderRejected("Paystack did not accept the request.") from None
        raise ProviderUnavailable("Paystack is temporarily unavailable.") from None
    except (URLError, TimeoutError, OSError, ValueError, TypeError):
        raise ProviderUnavailable("Paystack is temporarily unavailable.") from None


def initialize(attempt):
    data = request("transaction/initialize", {
        "email": attempt.customer_email, "amount": str(attempt.requested_minor), "currency": attempt.currency,
        "reference": attempt.reference, "channels": [attempt.channel],
        "callback_url": settings.PAYSTACK_CALLBACK_URL,
        "metadata": {"booking_id": str(attempt.booking_id), "payment_id": str(attempt.pk)},
    })
    url = data.get("authorization_url", "")
    if data.get("reference") != attempt.reference or urlsplit(url).scheme != "https" or urlsplit(url).hostname != "checkout.paystack.com":
        raise ProviderUnavailable("Paystack returned an unexpected checkout response.")
    return url


def verify(reference):
    return request("transaction/verify/"+quote(reference, safe=""))


def list_transactions(start, end, page=1):
    query = urlencode({"from": start.isoformat(), "to": end.isoformat(), "status": "success", "perPage": 100, "page": page})
    return request("transaction?"+query, expect_list=True)
