from django.urls import path
from . import views

urlpatterns = [
    path("access/", views.access),
    path("profile/", views.profile),
    path("phone/request/", views.phone_request),
    path("phone/verify/", views.phone_verify),
    path("public/cars/", views.public_cars),
    path("public/cars/<uuid:pk>/", views.public_cars),
    path("public/policy/", views.public_policy),
    path("bookings/", views.customer_bookings),
    path("bookings/<uuid:pk>/", views.booking_progress),
    path("bookings/<uuid:pk>/documents/", views.private_upload),
    path("bookings/<uuid:pk>/reuse-documents/", views.reuse_documents),
    path("bookings/<uuid:pk>/submit/", views.submit_kyc),
    path("documents/<uuid:pk>/link/", views.document_link),
    path("documents/<uuid:pk>/content/", views.document_content),
    path("reviews/", views.review_queue),
    path("reviews/<uuid:pk>/", views.review_queue),
    path("fleet/<uuid:pk>/", views.fleet_compliance),
    path("policies/", views.policies),
    path("staff/", views.staff_users),
    path("audit/", views.audit_events),
    path("notifications/", views.notifications),
    path("customers/<uuid:pk>/block/", views.block_customer),
]
