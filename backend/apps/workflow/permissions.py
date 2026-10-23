from rest_framework.permissions import BasePermission

ROLES = ["kyc_reviewer", "front_desk", "finance", "fleet_manager", "admin"]


def has_role(user, *roles):
    return user.is_authenticated and user.is_active and user.is_staff and (
        user.is_superuser or user.role == "admin" or user.groups.filter(name__in=roles).exists()
    )


class StaffAccess(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, *ROLES)


class FleetAccess(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "fleet_manager")


class KycAccess(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "kyc_reviewer")


class OwnerAccess(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "admin")


class BookingAccess(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "front_desk", "finance", "kyc_reviewer")
