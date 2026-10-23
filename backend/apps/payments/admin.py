from django.contrib import admin
from apps.workflow.admin import ReadOnlyAdmin
from .models import PaymentAttempt, PaymentEvent, PaymentReceipt, BookingPayment, FinanceNote, ManualSubmission
admin.site.register([PaymentAttempt, PaymentEvent, PaymentReceipt, BookingPayment, FinanceNote, ManualSubmission], ReadOnlyAdmin)
