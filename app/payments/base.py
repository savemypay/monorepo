import abc
from dataclasses import dataclass
from typing import Any, Dict, Optional


class PaymentStatus:
    PENDING = "pending"
    REQUIRES_ACTION = "requires_action"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELED = "canceled"


@dataclass
class PaymentResult:
    provider_payment_id: str
    status: str
    amount: int
    currency: str
    client_secret: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    raw: Optional[Dict[str, Any]] = None


@dataclass
class WebhookEvent:
    provider_payment_id: str
    status: str
    amount: int
    currency: str
    type: str
    raw: Dict[str, Any]


class PaymentProvider(abc.ABC):
    """Interface for payment providers."""

    @abc.abstractmethod
    def create_payment_intent(
        self,
        *,
        amount: int,
        currency: str,
        customer_ref: str | None,
        metadata: dict[str, Any] | None,
        idempotency_key: str,
    ) -> PaymentResult: ...

    @abc.abstractmethod
    def capture(self, provider_payment_id: str, amount: int | None = None) -> PaymentResult: ...

    @abc.abstractmethod
    def cancel(self, provider_payment_id: str) -> PaymentResult: ...

    @abc.abstractmethod
    def refund(self, provider_payment_id: str, amount: int | None = None, reason: str | None = None) -> PaymentResult: ...

    @abc.abstractmethod
    def parse_webhook(self, raw_body: bytes, headers: dict[str, str]) -> WebhookEvent: ...
