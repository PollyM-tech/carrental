from django.db import migrations


def guard(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute("CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON payments_manualsubmission FOR EACH ROW EXECUTE FUNCTION movara_reject_history_changes()")


def reverse(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute("DROP TRIGGER IF EXISTS append_only ON payments_manualsubmission")


class Migration(migrations.Migration):
    dependencies = [("payments", "0004_paymentattempt_provider_and_more")]
    operations = [migrations.RunPython(guard, reverse)]
