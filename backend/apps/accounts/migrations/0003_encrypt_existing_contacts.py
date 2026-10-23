from django.db import migrations


def encrypt_contacts(apps, schema_editor):
    User = apps.get_model("accounts", "User")
    for user in User.objects.all().iterator():
        User.objects.filter(pk=user.pk).update(email=user.email, phone=user.phone)


class Migration(migrations.Migration):
    dependencies = [("accounts", "0002_alter_user_email_alter_user_phone")]
    operations = [migrations.RunPython(encrypt_contacts, migrations.RunPython.noop)]
