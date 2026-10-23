from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/workflow/", include("apps.workflow.urls")),
    path("api/v1/rentals/", include("apps.rentals.urls")),

    path(
        "api/v1/",
        include("apps.core.urls"),
    ),

    path(
        "api/v1/auth/",
        include("apps.accounts.urls"),
    ),
]
from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
