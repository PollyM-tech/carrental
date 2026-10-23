from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from .models import Booking, Car


class DashboardTests(APITestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user(email="staff@example.com", password="test-password", is_staff=True, role="admin")
        self.customer = get_user_model().objects.create_user(email="customer@example.com", password="test-password")
        self.car = Car.objects.create(name="Test SUV", category="SUV", pricePerDay=5000, seats=5, transmission="Automatic", fuel="Petrol")
        self.base = "/api/v1/rentals/"

    def test_dashboard_requires_staff(self):
        self.assertEqual(self.client.get(self.base + "cars/").status_code, 401)
        self.client.force_authenticate(self.customer)
        self.assertEqual(self.client.get(self.base + "cars/").status_code, 403)

    def test_staff_login_rejects_customers_and_accepts_staff(self):
        response = self.client.post(self.base + "staff-login/", {"email": self.customer.email, "password": "test-password"})
        self.assertEqual(response.status_code, 401)
        response = self.client.post(self.base + "staff-login/", {"email": self.staff.email, "password": "test-password"})
        self.assertIn("challenge", response.data)
        from apps.workflow.auth import totp
        import time
        verified = self.client.post(self.base + "staff-verify/", {"challenge": response.data["challenge"], "code": totp(response.data["secret"], int(time.time())//30)})
        self.assertEqual(verified.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + verified.data["token"])
        response = self.client.get(self.base + "cars/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["_id"], str(self.car.pk))

    def test_car_crud_and_validation(self):
        self.client.force_authenticate(self.staff)
        response = self.client.post(self.base + "cars/update/", {"id": str(self.car.pk), "pricePerDay": -1})
        self.assertEqual(response.status_code, 400)
        response = self.client.post(self.base + "cars/update/", {"id": str(self.car.pk), "isFeatured": True})
        self.assertEqual(response.status_code, 200)
        self.car.refresh_from_db()
        self.assertTrue(self.car.isFeatured)
        self.assertEqual(self.client.post(self.base + "cars/delete/", {"id": str(self.car.pk)}).status_code, 200)
        self.assertEqual(self.client.get(self.base + "cars/").data, [])
        self.assertTrue(Car.objects.filter(pk=self.car.pk).exists())

    def test_booking_payment_shortcuts_are_disabled(self):
        self.client.force_authenticate(self.staff)
        booking = Booking.objects.create(car=self.car, customerName="Test customer")
        for action in ["confirm", "activate", "complete"]:
            self.assertEqual(self.client.post(self.base + f"bookings/{action}/", {"bookingId": str(booking.pk)}).status_code, 409)
        booking.refresh_from_db()
        self.assertEqual(booking.status, "draft")

    def test_settings_and_invalid_upload(self):
        self.client.force_authenticate(self.staff)
        self.assertEqual(self.client.get(self.base + "settings/").data, None)
        self.assertEqual(self.client.post(self.base + "settings/update/", {"businessName": "Movara Car Hire", "whatsappNumber": "254716741039"}).status_code, 200)
        self.assertEqual(self.client.get(self.base + "settings/").data["businessName"], "Movara Car Hire")
        self.assertEqual(self.client.post(self.base + "images/", {}).status_code, 400)


from io import BytesIO
import base64
import json
from unittest.mock import patch
from urllib.error import URLError
from urllib.parse import parse_qs
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from .cloudinary import CloudinaryConfigurationError, CloudinaryUploadError, upload_vehicle_image
from .models import CarImage
from .serializers import CarSerializer


@override_settings(CLOUDINARY_CLOUD_NAME="test-cloud", CLOUDINARY_API_KEY="test-key", CLOUDINARY_API_SECRET="test-secret")
class CloudinaryClientTests(SimpleTestCase):
    @patch("apps.rentals.cloudinary.urlopen")
    def test_authenticated_upload_and_delivery_url(self, urlopen):
        def upload_response(request, timeout):
            payload = parse_qs(request.data.decode())
            self.assertEqual(timeout, 30)
            self.assertEqual(request.full_url, "https://api.cloudinary.com/v1_1/test-cloud/image/upload")
            self.assertEqual(request.get_header("Authorization"), "Basic " + base64.b64encode(b"test-key:test-secret").decode())
            self.assertEqual(payload["allowed_formats"], ["jpg,png,webp"])
            self.assertEqual(payload["overwrite"], ["false"])
            self.assertTrue(payload["file"][0].startswith("data:image/png;base64,"))
            return BytesIO(json.dumps({"public_id": payload["public_id"][0], "secure_url": "https://res.cloudinary.com/test-cloud/image/upload/car.png", "resource_type": "image", "format": "png"}).encode())
        urlopen.side_effect = upload_response
        result = upload_vehicle_image(BytesIO(b"image-content"), "png")
        self.assertTrue(result["public_id"].startswith("movara/vehicles/"))
        self.assertTrue(result["secure_url"].startswith("https://res.cloudinary.com/"))

    @override_settings(CLOUDINARY_CLOUD_NAME="")
    @patch("apps.rentals.cloudinary.urlopen")
    def test_missing_configuration_does_not_upload(self, urlopen):
        with self.assertRaises(CloudinaryConfigurationError):
            upload_vehicle_image(BytesIO(b"image"), "jpg")
        urlopen.assert_not_called()

    @patch("apps.rentals.cloudinary.urlopen", side_effect=URLError("sensitive provider details"))
    def test_provider_failure_is_sanitized(self, urlopen):
        with self.assertRaises(CloudinaryUploadError) as error:
            upload_vehicle_image(BytesIO(b"image"), "jpg")
        self.assertNotIn("sensitive", str(error.exception))


class ImageUploadTests(APITestCase):
    def setUp(self):
        self.staff = get_user_model().objects.create_user(email="images@example.com", password="test-password", is_staff=True, role="admin")
        self.client.force_authenticate(self.staff)

    def image_file(self):
        return SimpleUploadedFile("vehicle.png", b"\x89PNG\r\n\x1a\nimage-content", content_type="image/png")

    @patch("apps.rentals.views.upload_vehicle_image")
    def test_upload_persists_cloud_asset_and_can_be_linked_to_car(self, upload):
        upload.return_value = {"public_id": "movara/vehicles/test", "secure_url": "https://res.cloudinary.com/test/image/upload/car.png"}
        response = self.client.post("/api/v1/rentals/images/", {"image": self.image_file()}, format="multipart")
        self.assertEqual(response.status_code, 201)
        image = CarImage.objects.get(pk=response.data["storageId"])
        self.assertEqual(image.cloudinaryPublicId, "movara/vehicles/test")
        self.assertFalse(image.file)
        car = Car.objects.create(name="SUV", category="SUV", pricePerDay=5000, seats=5, transmission="Automatic", fuel="Petrol", image=image)
        self.assertEqual(CarSerializer(car).data["displayImageUrl"], image.secureUrl)

    @patch("apps.rentals.views.upload_vehicle_image", side_effect=CloudinaryUploadError)
    def test_failed_upload_creates_no_record(self, upload):
        response = self.client.post("/api/v1/rentals/images/", {"image": self.image_file()}, format="multipart")
        self.assertEqual(response.status_code, 502)
        self.assertEqual(CarImage.objects.count(), 0)

    @patch("apps.rentals.views.upload_vehicle_image", side_effect=CloudinaryConfigurationError)
    def test_missing_configuration_returns_service_unavailable(self, upload):
        response = self.client.post("/api/v1/rentals/images/", {"image": self.image_file()}, format="multipart")
        self.assertEqual(response.status_code, 503)
        self.assertEqual(CarImage.objects.count(), 0)

    @patch("apps.rentals.views.upload_vehicle_image")
    def test_upload_rejects_non_images_and_non_staff(self, upload):
        file = SimpleUploadedFile("bad.svg", b"<svg/>", content_type="image/svg+xml")
        self.assertEqual(self.client.post("/api/v1/rentals/images/", {"image": file}, format="multipart").status_code, 400)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.post("/api/v1/rentals/images/", {"image": self.image_file()}, format="multipart").status_code, 401)
        upload.assert_not_called()

    def test_existing_local_image_still_has_url(self):
        from rest_framework.test import APIRequestFactory
        image = CarImage.objects.create(file="cars/old.jpg")
        car = Car.objects.create(name="Old SUV", category="SUV", pricePerDay=5000, seats=5, transmission="Automatic", fuel="Petrol", image=image)
        request = APIRequestFactory().get("/", HTTP_HOST="localhost")
        self.assertEqual(CarSerializer(car, context={"request": request}).data["displayImageUrl"], "http://localhost/media/cars/old.jpg")
