import logging
from typing import Any

import stripe
from stripe.error import SignatureVerificationError, StripeError

from app.core.config import STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
from app.payments.base import PaymentProvider, PaymentResult, PaymentStatus, WebhookEvent

logger = logging.getLogger(__name__)


def _map_status(intent: stripe.PaymentIntent) -> str:
    status = intent.status
    if status in ("requires_payment_method", "requires_confirmation", "requires_action"):
        return PaymentStatus.REQUIRES_ACTION
    if status == "succeeded":
        return PaymentStatus.SUCCEEDED
    if status == "canceled":
        return PaymentStatus.CANCELED
    return PaymentStatus.PENDING


class StripePaymentProvider(PaymentProvider):
    def __init__(self) -> None:
        if not STRIPE_API_KEY:
            raise ValueError("STRIPE_API_KEY is not set")
        stripe.api_key = STRIPE_API_KEY

    def create_payment_intent(
        self,
        *,
        amount: int,
        currency: str,
        customer_ref: str | None,
        metadata: dict[str, Any] | None,
        idempotency_key: str,
    ) -> PaymentResult:
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount,
                currency=currency,
                customer=customer_ref,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True},
                idempotency_key=idempotency_key,
            )
            return PaymentResult(
                provider_order_id=intent.id,
                status=_map_status(intent),
                amount=amount,
                currency=currency,
                client_secret=intent.client_secret,
                raw=intent.to_dict(),
            )
        except StripeError as exc:
            logger.exception("[Payment][stripe] create intent failed: %s", exc)
            return PaymentResult(
                provider_order_id="",
                status=PaymentStatus.FAILED,
                amount=amount,
                currency=currency,
                error_code=getattr(exc, "code", None),
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def capture(self, provider_order_id: str, amount: int | None = None) -> PaymentResult:
        try:
            intent = stripe.PaymentIntent.capture(provider_order_id, amount_to_capture=amount)
            return PaymentResult(
                provider_order_id=intent.id,
                status=_map_status(intent),
                amount=intent.amount_received or amount or 0,
                currency=intent.currency,
                raw=intent.to_dict(),
            )
        except StripeError as exc:
            logger.exception("[Payment][stripe] capture failed: %s", exc)
            return PaymentResult(
                provider_order_id=provider_order_id,
                status=PaymentStatus.FAILED,
                amount=amount or 0,
                currency="",
                error_code=getattr(exc, "code", None),
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def cancel(self, provider_order_id: str) -> PaymentResult:
        try:
            intent = stripe.PaymentIntent.cancel(provider_order_id)
            return PaymentResult(
                provider_order_id=intent.id,
                status=_map_status(intent),
                amount=intent.amount or 0,
                currency=intent.currency,
                raw=intent.to_dict(),
            )
        except StripeError as exc:
            logger.exception("[Payment][stripe] cancel failed: %s", exc)
            return PaymentResult(
                provider_order_id=provider_order_id,
                status=PaymentStatus.FAILED,
                amount=0,
                currency="",
                error_code=getattr(exc, "code", None),
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def refund(self, provider_order_id: str, amount: int | None = None, reason: str | None = None) -> PaymentResult:
        try:
            refund = stripe.Refund.create(payment_intent=provider_order_id, amount=amount, reason=reason)
            status = PaymentStatus.SUCCEEDED if refund.status == "succeeded" else PaymentStatus.PENDING
            return PaymentResult(
                provider_order_id=provider_order_id,
                status=status,
                amount=amount or 0,
                currency=refund.currency,
                raw=refund.to_dict(),
            )
        except StripeError as exc:
            logger.exception("[Payment][stripe] refund failed: %s", exc)
            return PaymentResult(
                provider_order_id=provider_order_id,
                status=PaymentStatus.FAILED,
                amount=amount or 0,
                currency="",
                error_code=getattr(exc, "code", None),
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def parse_webhook(self, raw_body: bytes, headers: dict[str, str]) -> WebhookEvent:
        if not STRIPE_WEBHOOK_SECRET:
            raise ValueError("STRIPE_WEBHOOK_SECRET is not set")
        sig_header = headers.get("stripe-signature", "")
        try:
            event = stripe.Webhook.construct_event(
                payload=raw_body, sig_header=sig_header, secret=STRIPE_WEBHOOK_SECRET
            )
        except SignatureVerificationError as exc:
            logger.warning("[Payment][stripe] webhook signature invalid: %s", exc)
            raise

        obj = event["data"]["object"]
        provider_order_id = obj.get("payment_intent") or obj.get("id")
        amount = obj.get("amount_received") or obj.get("amount") or 0
        currency = obj.get("currency") or "INR"
        status = _map_status(obj) if hasattr(obj, "status") else PaymentStatus.PENDING
        return WebhookEvent(
            provider_order_id=provider_order_id,
            status=status,
            amount=amount,
            currency=currency,
            type=event["type"],
            raw=event.to_dict() if hasattr(event, "to_dict") else dict(event),
        )
