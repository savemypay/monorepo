import logging
import secrets
from typing import Any

from app.payments.base import PaymentProvider, PaymentResult, PaymentStatus, WebhookEvent

logger = logging.getLogger(__name__)


class MockPaymentProvider(PaymentProvider):
    """Deterministic mock provider for dev/test."""

    def create_payment_intent(
        self,
        *,
        amount: int,
        currency: str,
        customer_ref: str | None,
        metadata: dict[str, Any] | None,
        idempotency_key: str,
    ) -> PaymentResult:
        provider_order_id = f"mock_{secrets.token_hex(8)}"
        logger.info("[Payment][mock] created order_id=%s amount=%s %s", provider_order_id, amount, currency)
        return PaymentResult(
            provider_order_id=provider_order_id,
            status=PaymentStatus.SUCCEEDED,
            amount=amount,
            currency=currency,
            client_secret=None,
            raw={"id": provider_order_id, "idempotency_key": idempotency_key},
        )

    def capture(self, provider_order_id: str, amount: int | None = None) -> PaymentResult:
        return PaymentResult(
            provider_order_id=provider_order_id,
            status=PaymentStatus.SUCCEEDED,
            amount=amount or 0,
            currency="INR",
            raw={"captured": True},
        )

    def cancel(self, provider_order_id: str) -> PaymentResult:
        return PaymentResult(
            provider_order_id=provider_order_id,
            status=PaymentStatus.CANCELED,
            amount=0,
            currency="INR",
            raw={"canceled": True},
        )

    def refund(self, provider_order_id: str, amount: int | None = None, reason: str | None = None) -> PaymentResult:
        return PaymentResult(
            provider_order_id=provider_order_id,
            status=PaymentStatus.SUCCEEDED,
            amount=amount or 0,
            currency="INR",
            raw={"refunded": True, "reason": reason},
        )

    def parse_webhook(self, raw_body: bytes, headers: dict[str, str]) -> WebhookEvent:
        # Mock webhooks are simple echoes
        payload = {"mock": "event"}
        return WebhookEvent(
            provider_order_id="mock_webhook",
            status=PaymentStatus.SUCCEEDED,
            amount=0,
            currency="INR",
            type="mock.event",
            raw=payload,
        )
