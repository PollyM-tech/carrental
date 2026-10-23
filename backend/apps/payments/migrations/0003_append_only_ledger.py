from django.db import migrations

TABLES = ["payments_paymentattempt", "payments_paymentevent", "payments_paymentreceipt", "payments_bookingpayment", "payments_financenote"]


def guards(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    for table in TABLES:
        schema_editor.execute(f"CREATE TRIGGER append_only BEFORE UPDATE OR DELETE ON {table} FOR EACH ROW EXECUTE FUNCTION movara_reject_history_changes()")
    schema_editor.execute("""
        CREATE FUNCTION movara_validate_payment_allocation() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM payments_paymentreceipt r JOIN payments_paymentattempt a ON r.attempt_id=a.id
                WHERE r.id=NEW.receipt_id AND a.booking_id=NEW.booking_id
            ) THEN RAISE EXCEPTION 'Payment receipt belongs to another booking'; END IF;
            RETURN NEW;
        END; $$
    """)
    schema_editor.execute("CREATE TRIGGER allocation_matches_booking BEFORE INSERT ON payments_bookingpayment FOR EACH ROW EXECUTE FUNCTION movara_validate_payment_allocation()")


def reverse(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    schema_editor.execute("DROP TRIGGER IF EXISTS allocation_matches_booking ON payments_bookingpayment")
    schema_editor.execute("DROP FUNCTION IF EXISTS movara_validate_payment_allocation()")
    for table in TABLES:
        schema_editor.execute(f"DROP TRIGGER IF EXISTS append_only ON {table}")


class Migration(migrations.Migration):
    dependencies = [("payments", "0002_paymentattempt_payment_base_matches_breakdown_and_more"), ("workflow", "0002_database_guards")]
    operations = [migrations.RunPython(guards, reverse)]
