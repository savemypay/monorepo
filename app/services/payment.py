import json
import logging
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import PAYMENT_CURRENCY, PAYMENT_IDEMPOTENCY_HEADER, PAYMENT_PROVIDER
from app.entities.payment import Payment
from app.payments.base import PaymentStatus
from app.payments.factory import get_payment_provider
from app.utils.response import error_response

logger = logging.getLogger(__name__)


def _provider():
    return get_payment_provider()


def _require_idempotency(idempotency_key: Optional[str]) -> str:
    if not idempotency_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(
                message=f"Missing idempotency header '{PAYMENT_IDEMPOTENCY_HEADER}'",
                code="idempotency_required",
            ),
        )
    return idempotency_key


def initiate_payment(
    db: Session,
    *,
    amount: int,
    currency: str | None,
    customer_ref: str | None,
    deal_ref: str | None,
    metadata: dict[str, Any] | None,
    idempotency_key: Optional[str],
) -> dict:
    currency = currency or PAYMENT_CURRENCY
    idempotency_key = _require_idempotency(idempotency_key)

    existing = (
        db.execute(
            select(Payment).where(
                Payment.provider == PAYMENT_PROVIDER,
                Payment.idempotency_key == idempotency_key,
            )
        )
        .scalars()
        .first()
    )
    if existing:
        logger.info("Payment idempotency hit key=%s payment_id=%s", idempotency_key, existing.id)
        return _serialize(existing)

    provider = _provider()
    result = provider.create_payment_intent(
        amount=amount,
        currency=currency,
        customer_ref=customer_ref,
        metadata=metadata or {},
        idempotency_key=idempotency_key,
    )

    payment = Payment(
        provider=PAYMENT_PROVIDER,
        provider_payment_id=result.provider_payment_id,
        status=result.status,
        amount=result.amount,
        currency=result.currency,
        idempotency_key=idempotency_key,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        client_secret=result.client_secret,
        error_code=result.error_code,
        error_message=result.error_message,
        raw_response=json.dumps(result.raw or {}),
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    if payment.status == PaymentStatus.FAILED:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=error_response(
                message="Payment failed",
                code=result.error_code or "payment_failed",
                details=result.error_message,
            ),
        )

    return _serialize(payment)


def handle_webhook(db: Session, *, raw_body: bytes, headers: dict[str, str]) -> None:
    provider = _provider()
    event = provider.parse_webhook(raw_body, headers)

    payment = (
        db.execute(
            select(Payment).where(
                Payment.provider_payment_id == event.provider_payment_id,
                Payment.provider == PAYMENT_PROVIDER,
            )
        )
        .scalars()
        .first()
    )
    if not payment:
        logger.warning("Payment webhook for unknown payment_id=%s", event.provider_payment_id)
        return

    payment.status = event.status
    payment.raw_webhook = json.dumps(event.raw)
    db.add(payment)
    db.commit()

    # Domain hook: at this layer we just update payment status.
    # Caller can react (e.g., mark reservation paid) after this call.


def _serialize(payment: Payment) -> dict:
    return {
        "id": payment.id,
        "provider": payment.provider,
        "provider_payment_id": payment.provider_payment_id,
        "status": payment.status,
        "amount": payment.amount,
        "currency": payment.currency,
        "idempotency_key": payment.idempotency_key,
        "client_secret": payment.client_secret,
        "error_code": payment.error_code,
        "error_message": payment.error_message,
    }
