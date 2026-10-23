from datetime import timedelta
import hashlib
from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.conf import settings
from apps.payments import paystack
from apps.payments.models import PaymentAttempt, PaymentState, WebhookInbox
from apps.payments.services import verify_payment, payment_event, review


class Command(BaseCommand):
    help = "Verify Paystack webhook events and reconcile recent payment attempts. Run every minute."

    def add_arguments(self, parser):
        parser.add_argument("--watch", action="store_true")
        parser.add_argument("--reconcile", action="store_true", help="Also verify recent confirmed receipts for reversals.")

    def handle(self, *args, **kwargs):
        import time
        last_reconciled_day = None
        while True:
            reconcile = kwargs["reconcile"] and last_reconciled_day != timezone.localdate()
            completed = self.tick(reconcile)
            if reconcile and completed:
                last_reconciled_day = timezone.localdate()
            if not kwargs["watch"]:
                return
            time.sleep(60)

    def tick(self, reconcile):
        if settings.PAYMENT_PROVIDER != "paystack" or not paystack.configuration_ready():
            self.stdout.write("Paystack credentials are not configured; no payments processed.")
            return
        if reconcile:
            end = timezone.now()
            start = end-timedelta(days=1)
            try:
                for page in range(1, 101):
                    rows = paystack.list_transactions(start, end, page)
                    for row in rows:
                        if not isinstance(row, dict) or row.get("status") != "success" or row.get("domain") != settings.PAYSTACK_MODE:
                            continue
                        ref = row.get("reference")
                        if not isinstance(ref, str) or not ref or len(ref) > 80:
                            continue
                        digest = hashlib.sha256(f"reconcile:{settings.PAYSTACK_MODE}:{row.get('id')}:{ref}".encode()).hexdigest()
                        WebhookInbox.objects.get_or_create(digest=digest, defaults={"event": "reconciliation.success", "reference": ref})
                    if len(rows) < 100:
                        break
                else:
                    self.stderr.write("Reconciliation reached its 10,000-transaction safety limit. Export and reconcile the remaining transactions in Paystack.")
                    return False
            except (paystack.ProviderUnavailable, paystack.ProviderRejected):
                self.stderr.write("Paystack statement reconciliation is temporarily unavailable; retry this run.")
                return False
        handled = set()
        inbox = WebhookInbox.objects.filter(processed_at=None).order_by("received_at")[:100]
        for item in inbox:
            attempt = PaymentAttempt.objects.select_related("booking").filter(reference=item.reference).first()
            try:
                if attempt:
                    verify_payment(attempt)
                    handled.add(attempt.pk)
                    if item.event not in ["charge.success", "reconciliation.success"]:
                        with transaction.atomic():
                            state = PaymentState.objects.select_for_update().get(attempt=attempt)
                            review(attempt, state, "Paystack reported a refund or dispute; reconcile this receipt in the Paystack dashboard.")
                item.processed_at = timezone.now()
                item.last_error = "" if attempt else "unmatched_reference"
            except (paystack.ProviderUnavailable, paystack.ProviderRejected):
                item.last_error = "verification_unavailable"
            item.attempts += 1
            item.save()
        since = timezone.now()-timedelta(days=7)
        statuses = ["initializing", "initialization_unknown", "pending", "failed"] + (["confirmed"] if reconcile else [])
        rows = PaymentAttempt.objects.select_related("booking", "state").filter(provider="paystack", created_at__gte=since, domain=settings.PAYSTACK_MODE, state__status__in=statuses).order_by("state__last_checked_at", "created_at")[:100]
        for attempt in rows:
            if attempt.pk in handled:
                continue
            try:
                verify_payment(attempt)
            except (paystack.ProviderUnavailable, paystack.ProviderRejected):
                PaymentState.objects.filter(attempt=attempt).update(last_checked_at=timezone.now(), check_count=F("check_count")+1)
                continue
        self.stdout.write("Paystack payment verification and reconciliation finished.")
        return True
