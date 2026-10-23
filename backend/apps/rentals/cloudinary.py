"""Server-side Cloudinary uploads using its authenticated REST API."""
import base64
import json
import re
import uuid
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

from django.conf import settings


class CloudinaryConfigurationError(Exception):
    pass


class CloudinaryUploadError(Exception):
    pass


def upload_vehicle_image(upload, extension):
    cloud = settings.CLOUDINARY_CLOUD_NAME
    key = settings.CLOUDINARY_API_KEY
    secret = settings.CLOUDINARY_API_SECRET
    if not cloud or not key or not secret:
        raise CloudinaryConfigurationError
    if not re.fullmatch(r"[A-Za-z0-9_-]+", cloud):
        raise CloudinaryConfigurationError

    mime = {"jpg": "image/jpeg", "png": "image/png", "webp": "image/webp"}[extension]
    public_id = f"movara/vehicles/{uuid.uuid4().hex}"
    data = urlencode({
        "file": f"data:{mime};base64," + base64.b64encode(upload.read()).decode("ascii"),
        "public_id": public_id,
        "overwrite": "false",
        "allowed_formats": "jpg,png,webp",
    }).encode("ascii")
    credentials = base64.b64encode(f"{key}:{secret}".encode()).decode("ascii")
    request = Request(
        f"https://api.cloudinary.com/v1_1/{cloud}/image/upload",
        data=data,
        headers={"Authorization": f"Basic {credentials}", "Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=30) as response:
            result = json.load(response)
        url = result.get("secure_url", "")
        if (result.get("public_id") != public_id or result.get("resource_type") != "image"
                or result.get("format") not in ["jpg", "png", "webp"]
                or urlsplit(url).scheme != "https" or urlsplit(url).hostname != "res.cloudinary.com"):
            raise CloudinaryUploadError
        return {"public_id": public_id, "secure_url": url}
    except (HTTPError, URLError, TimeoutError, OSError, ValueError, TypeError, AttributeError):
        # Provider errors may include credentials or account details; never return them.
        raise CloudinaryUploadError from None
