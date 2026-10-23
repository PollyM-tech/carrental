import json
from datetime import date
from datetime import timedelta
from urllib.parse import urlsplit
from django.conf import settings
from django.db import IntegrityError, transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import ValidationError
from apps.rentals.models import Booking, Car
from apps.workflow.models import CustomerProfile, KycCase, Notification
from apps.workflow.security import decrypt, fingerprint
from apps.workflow.services import audit, expire_holds, transition, vehicle_available
from . import paystack
from .models import BookingPayment, PaymentAttempt, PaymentEvent, PaymentReceipt, PaymentState, PaymentPolicy

ACTIVE = ["initializing", "initialization_unknown", "pending", "submitted"]


def payment_event(attempt, kind, actor=None, **details):
    PaymentEvent.objects.create(attempt=attempt, kind=kind, actor=actor, details=details)
    audit(actor, "payment."+kind, attempt)


def calculate_quote(booking, channel):
    manual = settings.PAYMENT_PROVIDER == "manual_mpesa"
    if manual and not settings.MPESA_RECEIVING_PHONE:
        raise ValidationError("The M-Pesa receiving number has not been configured.")
    if manual and channel != "manual_mpesa":
        raise ValidationError("Use manual M-Pesa Send Money for this booking.")
    if not manual and channel not in ["mobile_money", "card"]:
        raise ValidationError("Choose M-Pesa or card.")
    mode = "manual_mpesa" if manual else settings.PAYSTACK_FEE_MODE
    if mode not in ["gross_up", "provider", "manual_mpesa"]:
        raise ValidationError("Payment fee handling is not configured.")
    if mode == "gross_up" and channel != "mobile_money":
        raise ValidationError("Card checkout needs Paystack's automatic fee passing to be enabled first.")
    if mode == "provider" and not settings.PAYSTACK_PASS_FEES_ENABLED:
        raise ValidationError("Paystack automatic fee passing has not been confirmed for this account.")
    policy = PaymentPolicy.objects.filter(pk=1).first()
    if not policy or policy.deposit_timing == "pending":
        raise ValidationError("The security deposit policy must be approved before checkout opens.")
    if not booking.totalAmount or booking.totalAmount <= 0:
        raise ValidationError("The booking does not have a valid rental amount.")
    deposit = 0
    if policy.deposit_timing in ["online", "handover"]:
        deposit = policy.deposit_amounts.get(booking.car.category)
        if type(deposit) is not int or deposit < 0:
            raise ValidationError("The deposit for this vehicle category has not been configured.")
    rental = booking.totalAmount*100
    online_deposit = deposit*100 if policy.deposit_timing == "online" else 0
    handover_deposit = deposit*100 if policy.deposit_timing == "handover" else 0
    base = rental+online_deposit
    rate = settings.PAYSTACK_MPESA_RATE_BPS if mode == "gross_up" else 0
    if not 0 < rate < 10000 and mode == "gross_up":
        raise ValidationError("The payment fee rate is not configured correctly.")
    # Integer ceiling: enough to cover the fee on the gross amount, to one cent.
    gross = (base*10000+(10000-rate)-1)//(10000-rate) if mode == "gross_up" else base
    if gross > settings.PAYSTACK_MAX_AMOUNT_MINOR:
        raise ValidationError("This amount needs staff assistance before payment.")
    return {"rental_minor": rental, "deposit_minor": online_deposit, "handover_deposit_minor": handover_deposit,
        "base_minor": base, "surcharge_minor": gross-base if mode in ["gross_up", "manual_mpesa"] else None,
        "requested_minor": gross, "fee_rate_bps": rate, "fee_mode": mode}


def eligible(booking):
    if booking.status not in ["awaiting_payment", "payment_pending_verification"]:
        raise ValidationError("This booking is not awaiting payment.")
    if not booking.hold_expires_at or booking.hold_expires_at <= timezone.now():
        raise ValidationError("Your vehicle hold expired. Please start another booking.")
    case = KycCase.objects.filter(booking=booking, customer=booking.customer, status="approved").first()
    if not case:
        raise ValidationError("Booking-specific document approval is required before payment.")
    profile = CustomerProfile.objects.filter(user=booking.customer).first()
    if not profile or profile.blocked or not profile.phone_verified_at or profile.verified_phone_hash != fingerprint(booking.customer.phone) or decrypt(profile.details_encrypted) != decrypt(case.details_encrypted):
        raise ValidationError("Your customer details changed or need review. Contact staff before paying.")
    details = decrypt(case.details_encrypted)
    if date.fromisoformat(details["licence_expiry"]) < booking.returnDate or (details.get("id_expiry") and date.fromisoformat(details["id_expiry"]) < booking.returnDate):
        raise ValidationError("Your documents do not cover the full rental period.")
    if not vehicle_available(booking.car, booking.pickupDate, booking.returnDate, booking.pk):
        raise ValidationError("The vehicle is unavailable for the booking dates. Contact staff.")
    if BookingPayment.objects.filter(booking=booking).exists():
        raise ValidationError("This booking has already been paid.")
    return case


def create_quote(booking_id, customer, channel):
    expire_holds()
    with transaction.atomic():
        original = Booking.objects.get(pk=booking_id, customer=customer)
        Car.objects.select_for_update().get(pk=original.car_id)
        booking = Booking.objects.select_for_update(of=("self",)).select_related("car", "customer").get(pk=original.pk)
        case = eligible(booking)
        active = PaymentAttempt.objects.select_related("state").filter(Q(state__status__in=ACTIVE) | Q(provider="manual_mpesa", state__status="manual_review"), booking=booking).first()
        if active:
            if active.channel != channel:
                raise ValidationError("A payment is already in progress. Check its status before changing methods.")
            return active
        values = calculate_quote(booking, channel)
        attempt = PaymentAttempt.objects.create(booking=booking, customer=customer, customer_email=customer.email,
            provider=settings.PAYMENT_PROVIDER, receiving_phone=settings.MPESA_RECEIVING_PHONE if channel == "manual_mpesa" else "",
            kyc=case, reference="MOV-"+__import__("uuid").uuid4().hex, currency="KES", domain="manual" if channel == "manual_mpesa" else settings.PAYSTACK_MODE,
            channel=channel, hold_expires_at=booking.hold_expires_at,
            quote_expires_at=min(timezone.now()+timedelta(minutes=5), booking.hold_expires_at), **values)
        PaymentState.objects.create(attempt=attempt)
        payment_event(attempt, "quoted", customer)
        return attempt


def initialize_checkout(attempt, customer):
    if settings.PAYMENT_PROVIDER != "paystack" or attempt.provider != "paystack":
        raise ValidationError("Hosted checkout is currently disabled. Use manual Send Money.")
    if not paystack.configuration_ready():
        raise paystack.ProviderUnavailable("Paystack checkout is not configured yet.")
    callback = urlsplit(settings.PAYSTACK_CALLBACK_URL)
    if callback.scheme not in ["https", "http"] or not callback.hostname or (callback.scheme == "http" and not settings.DEBUG):
        raise paystack.ProviderUnavailable("Paystack's return page is not configured.")
    with transaction.atomic():
        Car.objects.select_for_update().get(pk=attempt.booking.car_id)
        booking = Booking.objects.select_for_update(of=("self",)).select_related("car", "customer").get(pk=attempt.booking_id)
        state = PaymentState.objects.select_for_update().get(attempt=attempt)
        eligible(booking)
        if state.status == "pending" and state.authorization_url:
            return state.authorization_url
        if state.status != "quoted":
            raise ValidationError("This payment needs a status check before another checkout can be started.")
        if attempt.quote_expires_at <= timezone.now() or attempt.hold_expires_at != booking.hold_expires_at:
            raise ValidationError("This payment quote expired. Refresh the amount before paying.")
        current = calculate_quote(booking, attempt.channel)
        if any(getattr(attempt, key) != value for key, value in current.items()) or attempt.domain != settings.PAYSTACK_MODE:
            raise ValidationError("Payment charges changed. Refresh the quote and confirm the new total.")
        if PaymentAttempt.objects.filter(booking=booking, state__status__in=ACTIVE).exclude(pk=attempt.pk).exists():
            raise ValidationError("Another payment is already being processed.")
        state.status = "initializing"
        state.consent_at = timezone.now()
        state.save()
        if booking.status == "awaiting_payment":
            transition(booking, "payment_pending_verification", customer, "Customer accepted the payment breakdown")
        payment_event(attempt, "initiated", customer)
    try:
        url = paystack.initialize(attempt)
    except (paystack.ProviderRejected, paystack.ProviderUnavailable) as error:
        with transaction.atomic():
            state = PaymentState.objects.select_for_update().get(attempt=attempt)
            if state.status == "initializing":
                state.status = "failed" if isinstance(error, paystack.ProviderRejected) else "initialization_unknown"
                state.save()
                payment_event(attempt, state.status, customer)
        raise
    with transaction.atomic():
        state = PaymentState.objects.select_for_update().get(attempt=attempt)
        state.authorization_url = url
        if state.status == "initializing":
            state.status = "pending"
        state.save()
        payment_event(attempt, "checkout_ready", customer)
    return url


def finance_alert(attempt, reason):
    from django.contrib.auth import get_user_model
    from apps.workflow.permissions import has_role
    for user in get_user_model().objects.filter(is_staff=True, is_active=True):
        if has_role(user, "finance"):
            Notification.objects.create(user=user, message=f"Payment {attempt.reference} requires review: {reason}")


def review(attempt, state, reason, actor=None):
    if state.status != "manual_review" or state.review_reason != reason:
        payment_event(attempt, "manual_review", actor, reason=reason)
        finance_alert(attempt, reason)
    state.status = "manual_review"
    state.review_reason = reason
    state.save()


def validate_verification(attempt, data):
    if data.get("reference") != attempt.reference or data.get("currency") != attempt.currency or data.get("domain") != attempt.domain:
        return "Provider reference, currency or test/live mode did not match."
    amount, fee = data.get("amount"), data.get("fees")
    if type(amount) is not int or amount <= 0 or type(fee) is not int or fee < 0 or fee > amount:
        return "Provider payment amounts were invalid."
    if attempt.fee_mode == "gross_up" and amount != attempt.requested_minor:
        return "The paid amount did not match the accepted total."
    if attempt.fee_mode == "provider":
        if data.get("requested_amount") != attempt.base_minor or amount-fee < attempt.base_minor or amount-fee > attempt.base_minor+1:
            return "Paystack did not pass the expected fee to the client."
    elif amount-fee < attempt.base_minor or amount-fee > attempt.base_minor+1:
        return "The client processing charge did not match the verified provider fee."
    if data.get("channel") != attempt.channel:
        return "The payment channel did not match checkout."
    metadata = data.get("metadata")
    if isinstance(metadata, str):
        try: metadata = json.loads(metadata)
        except ValueError: metadata = None
    if not isinstance(metadata, dict) or metadata.get("booking_id") != str(attempt.booking_id) or metadata.get("payment_id") != str(attempt.pk):
        return "The provider's booking details did not match."
    customer = data.get("customer")
    if not isinstance(customer, dict) or str(customer.get("email", "")).lower() != attempt.customer_email.lower():
        return "The provider's customer did not match the payment."
    provider_id = str(data.get("id", ""))
    if not provider_id.isdigit() or len(provider_id) > 30:
        return "The provider transaction ID was invalid."
    try: paid_at = parse_datetime(data.get("paid_at") or "")
    except (TypeError, ValueError): paid_at = None
    if not paid_at or timezone.is_naive(paid_at) or paid_at > timezone.now()+timedelta(minutes=5) or paid_at < attempt.created_at-timedelta(minutes=1):
        return "The provider payment timestamp was invalid."
    return ""


def verify_payment(attempt, actor=None):
    if attempt.provider != "paystack":
        raise ValidationError("Manual payments require finance verification against the receiving account.")
    # Network calls run outside database locks. Fulfilment is serialized below.
    if attempt.domain != settings.PAYSTACK_MODE:
        raise paystack.ProviderUnavailable("This payment belongs to a different Paystack mode.")
    data = paystack.verify(attempt.reference)
    with transaction.atomic():
        Car.objects.select_for_update().get(pk=attempt.booking.car_id)
        booking = Booking.objects.select_for_update(of=("self",)).select_related("car", "customer").get(pk=attempt.booking_id)
        state = PaymentState.objects.select_for_update().get(attempt=attempt)
        state.last_checked_at = timezone.now()
        state.check_count += 1
        state.save()
        observed = {
            "provider_status": str(data.get("status", "unknown"))[:40],
            "amount_minor": data.get("amount") if type(data.get("amount")) is int and data["amount"] >= 0 else None,
            "provider_fee_minor": data.get("fees") if type(data.get("fees")) is int and data["fees"] >= 0 else None,
            "currency": str(data.get("currency", ""))[:3],
            "provider_id": str(data.get("id", ""))[:30],
            "channel": str(data.get("channel", ""))[:30],
        }
        payment_event(attempt, "verified", actor, **observed)
        if data.get("reference") != attempt.reference:
            review(attempt, state, "The provider reference did not match this payment.", actor)
            return state
        if data.get("status") != "success":
            # A later pending/error result must never overwrite a paid receipt.
            if PaymentReceipt.objects.filter(attempt=attempt).exists():
                if data.get("status") == "reversed":
                    review(attempt, state, "The provider reports a reversal; finance must reconcile this payment.", actor)
                return state
            status = "failed" if data.get("status") in ["failed", "abandoned", "reversed"] else "pending"
            if state.status != status:
                payment_event(attempt, status, actor, provider_status=str(data.get("status", "unknown"))[:40])
                state.status = status
                state.save()
            return state
        mismatch = validate_verification(attempt, data)
        if mismatch:
            review(attempt, state, mismatch, actor)
            return state
        provider_id = str(data["id"])
        existing = PaymentReceipt.objects.filter(provider_transaction_id=provider_id).first()
        if existing and existing.attempt_id != attempt.pk:
            review(attempt, state, "This Paystack transaction was already recorded against another payment.", actor)
            return state
        receipt = PaymentReceipt.objects.filter(attempt=attempt).first()
        if receipt and receipt.provider_transaction_id != provider_id:
            review(attempt, state, "The provider transaction ID changed for an existing receipt.", actor)
            return state
        if not receipt:
            try:
                with transaction.atomic():
                    receipt = PaymentReceipt.objects.create(attempt=attempt, provider_transaction_id=provider_id, reference=attempt.reference,
                        currency=attempt.currency, amount_minor=data["amount"], provider_fee_minor=data["fees"], channel=data["channel"], paid_at=parse_datetime(data["paid_at"]))
            except IntegrityError:
                review(attempt, state, "The provider transaction was already recorded. Finance must reconcile this payment.", actor)
                return state
            payment_event(attempt, "received", actor, amount_minor=receipt.amount_minor, provider_fee_minor=receipt.provider_fee_minor)
        return allocate_receipt(attempt, booking, state, receipt, actor)


def allocate_receipt(attempt, booking, state, receipt, actor=None):
    allocated = BookingPayment.objects.filter(booking=booking).first()
    if allocated:
        if allocated.receipt_id == receipt.pk:
            if state.status == "manual_review":
                return state
            state.status = "confirmed"
            state.review_reason = ""
            state.save()
        else:
            review(attempt, state, "The booking was already paid; this additional payment needs finance review.", actor)
        return state
    if state.consent_at is None:
        review(attempt, state, "No client acceptance of the payment charges was recorded before this payment.", actor)
        return state
    if booking.status not in ["awaiting_payment", "payment_pending_verification"]:
        review(attempt, state, "Payment arrived after the booking expired or left the payment stage.", actor)
        return state
    if not booking.hold_expires_at or timezone.now() > booking.hold_expires_at or receipt.paid_at > attempt.hold_expires_at:
        review(attempt, state, "Payment was verified outside the vehicle hold window. Check availability and arrange an alternative or refund.", actor)
        return state
    if booking.hold_expires_at != attempt.hold_expires_at:
        review(attempt, state, "The vehicle hold changed after the payment quote. Finance must reconcile this receipt.", actor)
        return state
    if booking.totalAmount*100 != attempt.rental_minor:
        review(attempt, state, "The booking amount changed after the client accepted checkout.", actor)
        return state
    try:
        eligible(booking)
    except ValidationError:
        review(attempt, state, "KYC, customer details or vehicle availability changed after checkout started.", actor)
        return state
    # This inner savepoint lets the caller record a conflict without losing the receipt.
    try:
        with transaction.atomic():
            if booking.status == "awaiting_payment":
                transition(booking, "payment_pending_verification", actor, "Payment received")
            booking.confirmedAt = timezone.now()
            transition(booking, "confirmed", actor, "Payment receipt verified")
            BookingPayment.objects.create(booking=booking, receipt=receipt)
    except IntegrityError:
        review(attempt, state, "The vehicle reservation conflicted with another booking. Finance assistance is required.", actor)
        return state
    state.status = "confirmed"
    state.review_reason = ""
    state.save()
    payment_event(attempt, "confirmed", actor)
    Notification.objects.create(user=attempt.customer, message=f"Payment received. Your {booking.carName} booking is confirmed. Bring your original documents for pickup.")
    return state
