from django.urls import path
from . import views
from apps.workflow.auth import staff_login, staff_verify

urlpatterns = [
    path("staff-login/", staff_login),
    path("staff-verify/", staff_verify),
    path("cars/", views.cars),
    path("cars/<str:action>/", views.cars),
    path("bookings/", views.bookings),
    path("bookings/detail/", views.bookings, {"action": "detail"}),
    path("bookings/<str:action>/", views.booking_action),
    path("settings/", views.settings),
    path("settings/update/", views.settings, {"action": "update"}),
    path("images/", views.images),
    path("stats/", views.stats),
]
