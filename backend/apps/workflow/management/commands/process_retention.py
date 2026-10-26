from django.core.management.base import BaseCommand
from apps.workflow.privacy import run_retention


class Command(BaseCommand):
    help = "Erase expired operational personal data under the approved policy; preserves held/financial/audit evidence."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        self.stdout.write(str(run_retention(dry_run=options["dry_run"])))
