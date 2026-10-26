from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from apps.workflow.models import KycCase, Notification
from apps.workflow.services import expire_holds, staffed_due


class Command(BaseCommand):
    help = "Expire unpaid holds and record staffed-hours KYC alerts. Run every minute."

    def add_arguments(self, parser):
        parser.add_argument("--watch", action="store_true", help="Keep running every 60 seconds for local development.")

    def handle(self, *args, **kwargs):
        import time
        while True:
            self.tick()
            if not kwargs["watch"]:
                return
            time.sleep(60)

    def tick(self):
        expire_holds()
        from apps.workflow.privacy import run_retention
        run_retention()
        now = timezone.now()
        for pk in KycCase.objects.filter(status__in=["submitted", "in_review", "needs_correction"]).values_list("pk", flat=True):
            with transaction.atomic():
                case = KycCase.objects.select_for_update().get(pk=pk)
                if not case.due_at:
                    case.due_at = staffed_due(case.submitted_at)
                if not case.due_at:
                    continue
                for minutes, field, roles in [(15, "alerted_15", ["kyc_reviewer"]), (25, "alerted_25", ["admin"])]:
                    at = staffed_due(case.submitted_at, minutes)
                    if at and now >= at and not getattr(case, field):
                        users = get_user_model().objects.filter(is_active=True, is_staff=True)
                        for user in users:
                            if user.is_superuser or user.role == "admin" or user.groups.filter(name__in=roles).exists():
                                Notification.objects.create(user=user, message=f"KYC case {case.pk}: {minutes} staffed minutes elapsed.")
                        setattr(case, field, True)
                case.missed = case.missed or now > case.due_at
                case.save()
        self.stdout.write("Workflow holds and review alerts processed.")
