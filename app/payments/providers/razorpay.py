import json
import logging
from typing import Any

import razorpay
from razorpay.errors import SignatureVerificationError, BadRequestError

from app.core.config import (
    RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
    PAYMENT_CURRENCY,
)
from app.payments.base import PaymentProvider, PaymentResult, PaymentStatus, WebhookEvent

logger = logging.getLogger(__name__)


def _map_status(status: str) -> str:
    if status in ("created", "authorized"):
        return PaymentStatus.REQUIRES_ACTION
    if status == "captured":
        return PaymentStatus.SUCCEEDED
    if status == "failed":
        return PaymentStatus.FAILED
    if status == "refunded":
        return PaymentStatus.SUCCEEDED
    return PaymentStatus.PENDING


class RazorpayPaymentProvider(PaymentProvider):
    def __init__(self) -> None:
        if not (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET):
            raise ValueError("RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not set")
        self.client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

    def create_payment_intent(
        self,
        *,
        amount: int,
        currency: str,
        customer_ref: str | None,
        metadata: dict[str, Any] | None,
        idempotency_key: str,
    ) -> PaymentResult:
        # Razorpay requires an order first; payments occur client-side using the order_id.
        try:
            order = self.client.order.create(
                dict(
                    amount=amount,
                    currency=currency or PAYMENT_CURRENCY,
                    receipt=idempotency_key,
                    notes=metadata or {},
                    payment_capture=1,  # auto-capture
                )
            )
            return PaymentResult(
                provider_payment_id=order["id"],
                status=PaymentStatus.PENDING,  # actual payment comes via webhook/client confirmation
                amount=order["amount"],
                currency=order["currency"],
                client_secret=None,  # order_id is used on client
                raw=order,
            )
        except BadRequestError as exc:
            logger.exception("[Payment][razorpay] create order failed: %s", exc)
            return PaymentResult(
                provider_payment_id="",
                status=PaymentStatus.FAILED,
                amount=amount,
                currency=currency,
                error_code="bad_request",
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def capture(self, provider_payment_id: str, amount: int | None = None) -> PaymentResult:
        try:
            payment = self.client.payment.capture(provider_payment_id, amount)
            return PaymentResult(
                provider_payment_id=payment["id"],
                status=_map_status(payment.get("status", "")),
                amount=payment.get("amount", 0),
                currency=payment.get("currency", PAYMENT_CURRENCY),
                raw=payment,
            )
        except BadRequestError as exc:
            logger.exception("[Payment][razorpay] capture failed: %s", exc)
            return PaymentResult(
                provider_payment_id=provider_payment_id,
                status=PaymentStatus.FAILED,
                amount=amount or 0,
                currency=PAYMENT_CURRENCY,
                error_code="capture_failed",
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def cancel(self, provider_payment_id: str) -> PaymentResult:
        # Razorpay payments cannot be "canceled" after capture; we treat as refund flow.
        return self.refund(provider_payment_id, amount=None, reason="canceled")

    def refund(self, provider_payment_id: str, amount: int | None = None, reason: str | None = None) -> PaymentResult:
        try:
            refund = self.client.payment.refund(provider_payment_id, {"amount": amount, "notes": {"reason": reason}})
            return PaymentResult(
                provider_payment_id=provider_payment_id,
                status=_map_status(refund.get("status", "")),
                amount=refund.get("amount", amount or 0),
                currency=refund.get("currency", PAYMENT_CURRENCY),
                raw=refund,
            )
        except BadRequestError as exc:
            logger.exception("[Payment][razorpay] refund failed: %s", exc)
            return PaymentResult(
                provider_payment_id=provider_payment_id,
                status=PaymentStatus.FAILED,
                amount=amount or 0,
                currency=PAYMENT_CURRENCY,
                error_code="refund_failed",
                error_message=str(exc),
                raw={"error": str(exc)},
            )

    def parse_webhook(self, raw_body: bytes, headers: dict[str, str]) -> WebhookEvent:
        signature = headers.get("X-Razorpay-Signature", "")
        if not RAZORPAY_WEBHOOK_SECRET:
            raise ValueError("RAZORPAY_WEBHOOK_SECRET not set")
        try:
            self.client.utility.verify_webhook_signature(raw_body, signature, RAZORPAY_WEBHOOK_SECRET)
        except SignatureVerificationError as exc:
            logger.warning("[Payment][razorpay] webhook signature invalid: %s", exc)
            raise

        payload = json.loads(raw_body.decode("utf-8"))
        event_type = payload.get("event")
        entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
        provider_payment_id = entity.get("id") or payload.get("payload", {}).get("order", {}).get("entity", {}).get("id")
        amount = entity.get("amount", 0)
        currency = entity.get("currency", PAYMENT_CURRENCY)
        status = _map_status(entity.get("status", ""))

        return WebhookEvent(
            provider_payment_id=provider_payment_id,
            status=status,
            amount=amount,
            currency=currency,
            type=event_type or "razorpay.event",
            raw=payload,
        )
