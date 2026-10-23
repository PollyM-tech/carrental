from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import AuthenticationFailed

class StaffJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if user.is_staff and not validated_token.get("mfa"):
            raise AuthenticationFailed("Staff two-factor login is required.")
        return user


