import hashlib
import hmac
import json
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.decorators import api_view, authentication_classes, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from apps.rentals.models import Booking
from apps.workflow.permissions import OwnerAccess, has_role
from apps.workflow.services import audit
from . import paystack, manual
from .models import FinanceNote, PaymentAttempt, PaymentPolicy, WebhookInbox
from .services import create_quote, initialize_checkout, verify_payment


class FinanceAccess(BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, "finance")


class PaymentThrottle(UserRateThrottle):
    rate = "20/minute"
    scope = "payment_checkout"


def serialize_attempt(attempt):
    state = attempt.state
    receipt = getattr(attempt, "receipt", None)
    observed = attempt.events.filter(kind="verified").order_by("-created_at").first()
    submission = getattr(attempt, "submission", None)
    return {
        "provider": attempt.provider, "receiving_phone": attempt.receiving_phone,
        "transaction_code": submission.transaction_code if submission else None,
        "received_minor": receipt.amount_minor if receipt else observed.details.get("amount_minor") if observed else None,
        "id": str(attempt.pk), "reference": attempt.reference, "booking_id": str(attempt.booking_id),
        "status": state.status, "domain": attempt.domain, "currency": attempt.currency, "channel": attempt.channel, "fee_mode": attempt.fee_mode,
        "rental_minor": attempt.rental_minor, "deposit_minor": attempt.deposit_minor,
        "handover_deposit_minor": attempt.handover_deposit_minor, "base_minor": attempt.base_minor,
        "surcharge_minor": 0 if attempt.provider == "manual_mpesa" else receipt.amount_minor-attempt.base_minor if receipt else attempt.surcharge_minor,
        "total_minor": receipt.amount_minor if receipt else attempt.requested_minor if attempt.fee_mode in ["gross_up", "manual_mpesa"] else None,
        "quote_expires_at": attempt.quote_expires_at, "hold_expires_at": attempt.hold_expires_at,
        "checkout_url": state.authorization_url if state.status == "pending" and attempt.hold_expires_at > timezone.now() else "",
        "message": {
            "quoted": "Review the amount and send money to the dedicated M-Pesa number." if attempt.provider == "manual_mpesa" else "Review the amount before continuing to Paystack.",
            "submitted": "Transaction code submitted. Finance will verify receipt before confirming your booking. Do not pay again.",
            "pending": "Payment is pending. Complete the checkout or check its status.",
            "initializing": "Your checkout is being prepared. Please check again shortly.",
            "initialization_unknown": "We could not confirm checkout creation. Check the payment status before paying again.",
            "confirmed": "Payment received and booking confirmed.",
            "failed": "Finance could not verify this transaction code. Contact Movara before sending any more money." if attempt.provider == "manual_mpesa" else "This payment was not completed. You can request a new quote while your hold is valid.",
            "manual_review": "We received a payment update that needs finance review. Do not pay again; contact Movara with your reference.",
        }.get(state.status, "Contact Movara for help with this payment."),
        "paid_at": receipt.paid_at if receipt else None,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def capabilities(request):
    if settings.PAYMENT_PROVIDER == "manual_mpesa":
        return Response({"provider": "manual_mpesa", "configured": bool(settings.MPESA_RECEIVING_PHONE), "test_mode": False,
            "methods": [{"value": "manual_mpesa", "label": "M-Pesa Send Money"}], "fee_mode": "manual_mpesa"})
    provider_mode = settings.PAYSTACK_FEE_MODE == "provider" and settings.PAYSTACK_PASS_FEES_ENABLED
    return Response({"configured": paystack.configuration_ready(), "test_mode": settings.PAYSTACK_MODE == "test",
        "methods": [{"value": "mobile_money", "label": "M-Pesa"}] + ([{"value": "card", "label": "Card"}] if provider_mode else []),
        "fee_mode": settings.PAYSTACK_FEE_MODE})


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentThrottle])
def booking_payments(request, pk):
    booking = get_object_or_404(Booking, pk=pk, customer=request.user)
    if request.method == "GET":
        rows = PaymentAttempt.objects.filter(booking=booking).select_related("state", "receipt")[:30]
        return Response([serialize_attempt(row) for row in rows])
    attempt = create_quote(booking.pk, request.user, request.data.get("channel", "manual_mpesa" if settings.PAYMENT_PROVIDER == "manual_mpesa" else "mobile_money"))
    return Response(serialize_attempt(attempt), status=201)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentThrottle])
def checkout(request, pk):
    attempt = get_object_or_404(PaymentAttempt.objects.select_related("booking"), pk=pk, customer=request.user)
    if request.data.get("accept_charges") is not True:
        raise serializers.ValidationError("Confirm the rental amount and payment charges before continuing.")
    try:
        url = initialize_checkout(attempt, request.user)
    except paystack.ProviderUnavailable:
        return Response({"detail": "Paystack checkout is not available right now. Check the payment status before retrying."}, status=503)
    except paystack.ProviderRejected:
        return Response({"detail": "Paystack could not create this checkout. Refresh your quote or contact Movara."}, status=502)
    return Response({"authorization_url": url, "reference": attempt.reference})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentThrottle])
def verify(request):
    reference = request.data.get("reference")
    if not isinstance(reference, str) or len(reference) > 80:
        raise serializers.ValidationError("A valid payment reference is required.")
    attempt = get_object_or_404(PaymentAttempt.objects.select_related("booking"), reference=reference, customer=request.user)
    if attempt.provider == "manual_mpesa":
        return Response(serialize_attempt(attempt))
    if attempt.state.status == "quoted":
        raise serializers.ValidationError("This payment has not been started.")
    try:
        verify_payment(attempt, request.user)
    except (paystack.ProviderUnavailable, paystack.ProviderRejected):
        return Response({"detail": "Paystack has not returned a payment result yet. Please check again shortly; do not pay twice."}, status=503)
    attempt = PaymentAttempt.objects.select_related("state", "receipt").get(pk=attempt.pk)
    return Response(serialize_attempt(attempt))


@api_view(["POST"])
@authentication_classes([])
@permission_classes([AllowAny])
def webhook(request):
    if settings.PAYMENT_PROVIDER != "paystack" or not paystack.configuration_ready():
        return Response(status=503)
    raw = request.body
    if len(raw) > 1024*1024:
        return Response(status=413)
    signature = request.headers.get("x-paystack-signature", "")
    expected = hmac.new(settings.PAYSTACK_SECRET_KEY.encode(), raw, hashlib.sha512).hexdigest()
    if not hmac.compare_digest(expected, signature):
        return Response(status=401)
    try:
        body = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        return Response(status=400)
    if not isinstance(body, dict):
        return Response(status=400)
    event = body.get("event")
    if event not in ["charge.success", "refund.processed", "refund.failed", "charge.dispute.create"]:
        return Response(status=200)
    data = body.get("data")
    if not isinstance(data, dict):
        return Response(status=400)
    reference = data.get("reference")
    if not reference and isinstance(data.get("transaction"), dict):
        reference = data["transaction"].get("reference")
    if not isinstance(reference, str) or len(reference) > 80:
        return Response(status=200)
    # Store only routing fields and a digest, never card authorization or raw PII.
    WebhookInbox.objects.get_or_create(digest=hashlib.sha256(raw).hexdigest(), defaults={"event": event, "reference": reference})
    return Response(status=200)


@api_view(["GET"])
@permission_classes([FinanceAccess])
def finance_payments(request):
    rows = PaymentAttempt.objects.select_related("state", "receipt", "booking").exclude(state__status="quoted").order_by("-created_at")
    if request.query_params.get("status"):
        rows = rows.filter(state__status=request.query_params["status"])
    return Response([{**serialize_attempt(row), "car_name": row.booking.carName,
        "review_reason": row.state.review_reason, "provider_fee_minor": row.receipt.provider_fee_minor if hasattr(row, "receipt") else None,
        "notes": list(row.finance_notes.values("reason", "created_at"))} for row in rows[:200]])


@api_view(["POST"])
@permission_classes([FinanceAccess])
def finance_check(request, pk):
    attempt = get_object_or_404(PaymentAttempt.objects.select_related("booking"), pk=pk)
    try:
        verify_payment(attempt, request.user)
    except (paystack.ProviderUnavailable, paystack.ProviderRejected):
        return Response({"detail": "Paystack verification is temporarily unavailable."}, status=503)
    return Response(serialize_attempt(PaymentAttempt.objects.select_related("state", "receipt").get(pk=pk)))


@api_view(["POST"])
@permission_classes([FinanceAccess])
def finance_note(request, pk):
    attempt = get_object_or_404(PaymentAttempt, pk=pk)
    reason = request.data.get("reason", "")
    if not isinstance(reason, str) or not reason.strip() or len(reason) > 2000:
        raise serializers.ValidationError("Enter a note of up to 2000 characters.")
    with transaction.atomic():
        FinanceNote.objects.create(attempt=attempt, actor=request.user, reason=reason.strip())
        audit(request.user, "payment.finance_note", attempt, reason.strip())
    return Response({"saved": True})


class PaymentPolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentPolicy
        fields = "__all__"
        read_only_fields = ["id"]

    def validate_deposit_amounts(self, value):
        if not isinstance(value, dict) or any(not isinstance(k, str) or type(v) is not int or v < 0 for k, v in value.items()):
            raise serializers.ValidationError("Use a category-to-amount object with non-negative whole KES amounts.")
        return value


@api_view(["GET", "POST"])
@permission_classes([OwnerAccess])
def payment_policy(request):
    policy = PaymentPolicy.objects.filter(pk=1).first()
    if request.method == "GET":
        return Response(PaymentPolicySerializer(policy).data if policy else {"deposit_timing": "pending", "deposit_amounts": {}})
    reason = request.data.get("reason", "")
    if not isinstance(reason, str) or not reason.strip():
        raise serializers.ValidationError("Record the approval reference for the deposit decision.")
    serializer = PaymentPolicySerializer(policy, data=request.data)
    serializer.is_valid(raise_exception=True)
    with transaction.atomic():
        policy = serializer.save(id=1)
        audit(request.user, "payment.deposit_policy_updated", policy, reason.strip())
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([FinanceAccess])
def unmatched_webhooks(request):
    return Response(list(WebhookInbox.objects.filter(last_error="unmatched_reference").order_by("-received_at").values("event", "reference", "received_at")[:100]))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([PaymentThrottle])
def manual_submit(request, pk):
    attempt = get_object_or_404(PaymentAttempt.objects.select_related("booking"), pk=pk, customer=request.user)
    if request.data.get("accept_amount") is not True:
        raise serializers.ValidationError("Confirm the displayed amount and receiving number.")
    manual.submit(attempt, request.user, request.data.get("transaction_code"))
    return Response(serialize_attempt(PaymentAttempt.objects.get(pk=pk)))


@api_view(["POST"])
@permission_classes([FinanceAccess])
def manual_decision(request, pk):
    attempt = get_object_or_404(PaymentAttempt.objects.select_related("booking"), pk=pk)
    manual.decide(attempt, request.user, request.data)
    return Response(serialize_attempt(PaymentAttempt.objects.get(pk=pk)))
