from django import forms
from django.contrib import admin
from django.contrib.admin.forms import AdminAuthenticationForm
from django.db import transaction
from .auth import verify_totp
from .models import AuditEvent, BookingHistory, StaffAuthenticator, Policy, KycDecision, VehicleDocument, VehicleBlock
from .services import audit


class StaffAdminForm(AdminAuthenticationForm):
    otp = forms.CharField(label="Authenticator code", max_length=6)

    def clean(self):
        data = super().clean()
        user = self.get_user()
        if user:
            with transaction.atomic():
                authenticator = StaffAuthenticator.objects.select_for_update().filter(user=user, enabled=True).first()
                if not authenticator or not verify_totp(authenticator, data.get("otp", "")):
                    raise forms.ValidationError("Enter a fresh authenticator code. Enroll first at the Movara staff login.")
        return data


admin.site.login_form = StaffAdminForm
admin.site.login_template = "admin/movara_login.html"


class ReadOnlyAdmin(admin.ModelAdmin):
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return False


class LoggedAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        audit(request.user, "admin.updated" if change else "admin.created", obj)

    def has_delete_permission(self, request, obj=None): return False


admin.site.register([AuditEvent, BookingHistory, KycDecision], ReadOnlyAdmin)
admin.site.register([Policy, VehicleDocument, VehicleBlock], ReadOnlyAdmin)
