from django.db import migrations


def encrypt_contacts(apps, schema_editor):
    Booking = apps.get_model("rentals", "Booking")
    for booking in Booking.objects.all().iterator():
        Booking.objects.filter(pk=booking.pk).update(customerEmail=booking.customerEmail, customerPhone=booking.customerPhone)


class Migration(migrations.Migration):
    dependencies = [("rentals", "0006_alter_booking_customeremail_and_more"), ("accounts", "0003_encrypt_existing_contacts")]
    operations = [migrations.RunPython(encrypt_contacts, migrations.RunPython.noop)]
