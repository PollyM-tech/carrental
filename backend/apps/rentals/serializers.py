from rest_framework import serializers
from .models import Booking, BusinessSettings, Car, CarImage


class TimestampField(serializers.Field):
    def to_representation(self, value):
        return int(value.timestamp() * 1000) if value else None


class RecordSerializer(serializers.ModelSerializer):
    _id = serializers.UUIDField(source="id", read_only=True)
    _creationTime = TimestampField(source="createdAt", read_only=True)
    createdAt = TimestampField(read_only=True)
    updatedAt = TimestampField(read_only=True)


class CarSerializer(RecordSerializer):
    imageStorageId = serializers.PrimaryKeyRelatedField(source="image", queryset=CarImage.objects.all(), required=False, allow_null=True)
    displayImageUrl = serializers.SerializerMethodField()

    def get_displayImageUrl(self, car):
        if car.image:
            if car.image.secureUrl:
                return car.image.secureUrl
            if car.image.file:
                return self.context["request"].build_absolute_uri(car.image.file.url)
        return car.imageUrl or None

    class Meta:
        model = Car
        exclude = ["id", "image", "deletedAt"]

    def validate_plateNumber(self, value):
        return value.strip().upper()

    def validate_pricePerDay(self, value):
        if value <= 0:
            raise serializers.ValidationError("Daily price must be positive.")
        return value

    def validate_seats(self, value):
        if value <= 0:
            raise serializers.ValidationError("Seats must be positive.")
        return value


class BookingSerializer(RecordSerializer):
    carId = serializers.PrimaryKeyRelatedField(source="car", queryset=Car.objects.filter(deletedAt=None), required=False, allow_null=True)
    carImageUrl = serializers.SerializerMethodField()
    car = CarSerializer(read_only=True)
    customer = serializers.SerializerMethodField()
    confirmedAt = TimestampField(read_only=True)
    cancelledAt = TimestampField(read_only=True)
    completedAt = TimestampField(read_only=True)

    def get_customer(self, obj):
        return None

    def get_carImageUrl(self, obj):
        return CarSerializer(obj.car, context=self.context).data["displayImageUrl"] if obj.car else None

    def validate(self, data):
        start, end = data.get("pickupDate"), data.get("returnDate")
        if bool(start) != bool(end) or (start and end <= start):
            raise serializers.ValidationError("Choose a return date after the pickup date.")
        return data

    class Meta:
        model = Booking
        exclude = ["id"]
        read_only_fields = ["status", "totalDays", "totalAmount", "cancelReason", "notes"]


class SettingsSerializer(RecordSerializer):
    class Meta:
        model = BusinessSettings
        exclude = ["id", "singleton"]
