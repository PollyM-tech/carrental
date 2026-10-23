from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.workflow.auth import CustomerTokenSerializer

from .views import LogoutView, MeView, RegisterView


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        TokenObtainPairView.as_view(serializer_class=CustomerTokenSerializer),
        name="login",
    ),

    path(
        "token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    path(
        "me/",
        MeView.as_view(),
        name="me",
    ),
]