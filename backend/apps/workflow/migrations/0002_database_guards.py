from django.db import migrations


def guards(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    schema_editor.execute("CREATE EXTENSION IF NOT EXISTS btree_gist")
    schema_editor.execute("""
        ALTER TABLE rentals_booking ADD CONSTRAINT no_overlapping_vehicle_rentals
        EXCLUDE USING gist (car_id WITH =, daterange("pickupDate", "returnDate", '[)') WITH &&)
        WHERE (status IN ('kyc_approved', 'awaiting_payment', 'payment_pending_verification',
        'confirmed', 'handover_in_progress', 'active', 'returned') AND car_id IS NOT NULL)
    """)
    schema_editor.execute("""
        ALTER TABLE rentals_booking ADD CONSTRAINT blocking_booking_has_dates
        CHECK (status NOT IN ('kyc_approved', 'awaiting_payment', 'payment_pending_verification',
        'confirmed', 'handover_in_progress', 'active', 'returned') OR
        ("pickupDate" IS NOT NULL AND "returnDate" IS NOT NULL AND "returnDate" > "pickupDate"))
    """)
    schema_editor.execute("""
        CREATE FUNCTION movara_reject_history_changes() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN RAISE EXCEPTION 'Movara history records are append-only'; END; $$
    """)
    for table in ["workflow_auditevent", "workflow_bookinghistory", "workflow_kycdecision", "workflow_privatedocument"]:
        schema_editor.execute(f"CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON {table} FOR EACH ROW EXECUTE FUNCTION movara_reject_history_changes()")


def reverse(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    for table in ["workflow_auditevent", "workflow_bookinghistory", "workflow_kycdecision", "workflow_privatedocument"]:
        schema_editor.execute(f"DROP TRIGGER IF EXISTS append_only ON {table}")
    schema_editor.execute("DROP FUNCTION IF EXISTS movara_reject_history_changes()")
    schema_editor.execute("ALTER TABLE rentals_booking DROP CONSTRAINT IF EXISTS no_overlapping_vehicle_rentals")
    schema_editor.execute("ALTER TABLE rentals_booking DROP CONSTRAINT IF EXISTS blocking_booking_has_dates")


class Migration(migrations.Migration):
    dependencies = [("workflow", "0001_initial"), ("rentals", "0004_legacy_booking_statuses")]
    operations = [migrations.RunPython(guards, reverse)]
