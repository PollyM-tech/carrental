from django.urls import path
from . import views

urlpatterns = [
    path("manual/<uuid:pk>/submit/", views.manual_submit),
    path("manual/<uuid:pk>/decision/", views.manual_decision),
    path("capabilities/", views.capabilities),
    path("bookings/<uuid:pk>/", views.booking_payments),
    path("checkout/<uuid:pk>/", views.checkout),
    path("verify/", views.verify),
    path("webhook/", views.webhook),
    path("unmatched/", views.unmatched_webhooks),
    path("finance/", views.finance_payments),
    path("finance/<uuid:pk>/verify/", views.finance_check),
    path("finance/<uuid:pk>/notes/", views.finance_note),
    path("policy/", views.payment_policy),
]
