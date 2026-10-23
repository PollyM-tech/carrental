from django.contrib import admin
from .models import Booking, BusinessSettings, Car
from apps.workflow.admin import ReadOnlyAdmin

# Workflow changes must use the API so permission checks, audit and status gates apply.
admin.site.register([Car, Booking, BusinessSettings], ReadOnlyAdmin)
