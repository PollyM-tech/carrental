from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.workflow.models import StaffAuthenticator
from apps.workflow.services import audit


class Command(BaseCommand):
    help = "Recover a lost staff authenticator. Requires trusted server access and a recorded reason."

    def add_arguments(self, parser):
        parser.add_argument("email")
        parser.add_argument("--reason", required=True)

    def handle(self, *args, **kwargs):
        if not kwargs["reason"].strip():
            raise CommandError("A recovery reason is required.")
        user = get_user_model().objects.filter(email=kwargs["email"], is_staff=True).first()
        if not user:
            raise CommandError("Staff account not found.")
        with transaction.atomic():
            StaffAuthenticator.objects.filter(user=user).delete()
            audit(None, "staff.mfa_recovery", user, kwargs["reason"])
        self.stdout.write("Authenticator reset. The staff member must enroll again at next login.")
