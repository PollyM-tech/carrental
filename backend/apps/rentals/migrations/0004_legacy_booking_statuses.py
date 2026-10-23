from django.db import migrations


def convert(apps, schema_editor):
    Booking = apps.get_model("rentals", "Booking")
    Booking.objects.filter(status="pending").update(status="draft")
    Booking.objects.filter(status="completed").update(status="closed")


class Migration(migrations.Migration):
    dependencies = [("rentals", "0003_booking_customer_booking_hold_expires_at_car_mileage_and_more")]
    operations = [migrations.RunPython(convert, migrations.RunPython.noop)]
