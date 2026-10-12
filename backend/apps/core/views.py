from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        database_status = "connected"

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            database_status = "disconnected"

        status_code = 200 if database_status == "connected" else 503

        return Response(
            {
                "status": "ok" if database_status == "connected" else "error",
                "service": "movara-api",
                "version": "1.0.0",
                "database": database_status,
            },
            status=status_code,
        )