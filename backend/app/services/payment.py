import json
import logging
from decimal import Decimal
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import select, cast, String
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import PAYMENT_CURRENCY, PAYMENT_IDEMPOTENCY_HEADER, PAYMENT_PROVIDER
from app.entities.ad import Ad
from app.entities.payment import Payment
from app.payments.base import PaymentStatus
from app.payments.factory import get_payment_provider
from app.utils.response import error_response

logger = logging.getLogger(__name__)


def _now() -> datetime:
    return datetime.now(timezone.utc)


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


def _get_payment_by_idempotency(db: Session, *, idempotency_key: str) -> Payment | None:
    return (
        db.execute(
            select(Payment).where(
                Payment.provider == PAYMENT_PROVIDER,
                Payment.idempotency_key == idempotency_key,
            )
        )
        .scalars()
        .first()
    )


def _validate_idempotent_payment_request(
    payment: Payment,
    *,
    amount: int,
    currency: str,
    customer_ref: str | None,
    deal_ref: str | None,
) -> None:
    if (
        payment.amount != amount
        or payment.currency != currency
        or payment.customer_ref != customer_ref
        or payment.deal_ref != deal_ref
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=error_response(
                message="Idempotency key already used for another payment",
                code="idempotency_key_reused",
            ),
        )


def _get_existing_payment_for_deal(
    db: Session,
    *,
    customer_ref: str,
    deal_ref: str,
    statuses: list[str],
) -> Payment | None:
    return (
        db.execute(
            select(Payment)
            .where(
                Payment.provider == PAYMENT_PROVIDER,
                Payment.customer_ref == customer_ref,
                Payment.deal_ref == deal_ref,
                Payment.status.in_(statuses),
            )
            .order_by(Payment.created_at.desc(), Payment.id.desc())
        )
        .scalars()
        .first()
    )


def _get_existing_token_payment_response(
    db: Session,
    *,
    customer_ref: str,
    deal_ref: str,
    idempotency_key: str,
    amount: int | None = None,
    currency: str | None = None,
) -> dict | None:
    successful_payment = _get_existing_payment_for_deal(
        db,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        statuses=[PaymentStatus.SUCCEEDED],
    )
    if successful_payment:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=error_response(message="Payment already done", code="payment_already_done"),
        )

    existing_by_key = _get_payment_by_idempotency(db, idempotency_key=idempotency_key)
    if existing_by_key:
        if amount is not None and currency is not None:
            _validate_idempotent_payment_request(
                existing_by_key,
                amount=amount,
                currency=currency,
                customer_ref=customer_ref,
                deal_ref=deal_ref,
            )
        elif existing_by_key.customer_ref != customer_ref or existing_by_key.deal_ref != deal_ref:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_response(
                    message="Idempotency key already used for another payment",
                    code="idempotency_key_reused",
                ),
            )
        return _serialize(existing_by_key)

    in_flight_payment = _get_existing_payment_for_deal(
        db,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        statuses=[PaymentStatus.PENDING, PaymentStatus.REQUIRES_ACTION],
    )
    if in_flight_payment:
        return _serialize(in_flight_payment)

    return None


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
    expires_at = _now() + timedelta(minutes=15)

    existing = _get_payment_by_idempotency(db, idempotency_key=idempotency_key)
    if existing:
        _validate_idempotent_payment_request(
            existing,
            amount=amount,
            currency=currency,
            customer_ref=customer_ref,
            deal_ref=deal_ref,
        )
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
        provider_order_id=result.provider_order_id,
        status=result.status,
        amount=result.amount,
        currency=result.currency,
        idempotency_key=idempotency_key,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        client_secret=result.client_secret,
        expires_at=expires_at,
        slot_reserved=True,
        error_code=result.error_code,
        error_message=result.error_message,
        raw_response=json.dumps(result.raw or {}),
    )
    db.add(payment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = _get_payment_by_idempotency(db, idempotency_key=idempotency_key)
        if not existing:
            raise
        _validate_idempotent_payment_request(
            existing,
            amount=amount,
            currency=currency,
            customer_ref=customer_ref,
            deal_ref=deal_ref,
        )
        logger.info("Payment idempotency recovered key=%s payment_id=%s", idempotency_key, existing.id)
        return _serialize(existing)
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


def initiate_token_payment(
    db: Session,
    *,
    ad_id: int,
    customer_ref: str,
    customer_id: int | str | None,
    idempotency_key: Optional[str],
) -> dict:
    idempotency_key = _require_idempotency(idempotency_key)
    deal_ref = str(ad_id)
    currency = PAYMENT_CURRENCY

    existing_payment_response = _get_existing_token_payment_response(
        db,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        idempotency_key=idempotency_key,
    )
    if existing_payment_response:
        return existing_payment_response

    ad = (
        db.query(Ad)
        .filter(Ad.id == ad_id, Ad.status == "active")
        .with_for_update()
        .first()
    )
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not available", code="ad_not_found"),
        )
    if ad.token_amount is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Token amount not configured", code="token_missing"),
        )

    amount_minor = int(Decimal(ad.token_amount) * 100)

    existing_payment_response = _get_existing_token_payment_response(
        db,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        idempotency_key=idempotency_key,
        amount=amount_minor,
        currency=currency,
    )
    if existing_payment_response:
        return existing_payment_response

    if ad.slots_remaining <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Ad is filled", code="ad_filled"),
        )

    ad.slots_remaining -= 1

    try:
        result = _provider().create_payment_intent(
            amount=amount_minor,
            currency=currency,
            customer_ref=customer_ref,
            metadata={"ad_id": ad.id, "vendor_id": ad.vendor_id, "customer_id": customer_id},
            idempotency_key=idempotency_key,
        )
    except Exception:
        db.rollback()
        raise

    slot_reserved = True
    if result.status == PaymentStatus.FAILED:
        ad.slots_remaining += 1
        slot_reserved = False

    payment = Payment(
        provider=PAYMENT_PROVIDER,
        provider_order_id=result.provider_order_id,
        status=result.status,
        amount=result.amount,
        currency=result.currency,
        idempotency_key=idempotency_key,
        customer_ref=customer_ref,
        deal_ref=deal_ref,
        client_secret=result.client_secret,
        expires_at=_now() + timedelta(minutes=15),
        slot_reserved=slot_reserved,
        error_code=result.error_code,
        error_message=result.error_message,
        raw_response=json.dumps(result.raw or {}),
    )
    db.add(ad)
    db.add(payment)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = _get_payment_by_idempotency(db, idempotency_key=idempotency_key)
        if not existing:
            raise
        _validate_idempotent_payment_request(
            existing,
            amount=amount_minor,
            currency=currency,
            customer_ref=customer_ref,
            deal_ref=deal_ref,
        )
        return _serialize(existing)
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
                Payment.provider_order_id == event.provider_order_id,
                Payment.provider == PAYMENT_PROVIDER,
            )
        )
        .scalars()
        .first()
    )
    if not payment:
        logger.warning("Payment webhook for unknown order_id=%s", event.provider_order_id)
        return

    if event.payment_id:
        payment.payment_id = event.payment_id
    payment.status = event.status
    payment.raw_webhook = json.dumps(event.raw)
    db.add(payment)
    db.commit()

    if payment.slot_reserved and payment.deal_ref and payment.status in (PaymentStatus.FAILED, PaymentStatus.CANCELED):
        try:
            release_slot(db, int(payment.deal_ref))
        except Exception:
            logger.exception("Failed to release slot for deal_ref=%s on webhook", payment.deal_ref)

    # Domain hook: at this layer we just update payment status.
    # Caller can react (e.g., mark reservation paid) after this call.


def expire_stale_payments(db: Session, vendor_id: Optional[int] = None) -> int:
    now = _now()
    q = db.query(Payment).filter(
        Payment.status.in_([PaymentStatus.PENDING, PaymentStatus.REQUIRES_ACTION]),
        Payment.expires_at.isnot(None),
        Payment.expires_at < now,
    )
    if vendor_id is not None:
        q = q.join(Ad, Payment.deal_ref == cast(Ad.id, String)).filter(Ad.vendor_id == vendor_id)

    payments = q.all()
    released = 0
    for p in payments:
        p.status = PaymentStatus.CANCELED
        if p.slot_reserved and p.deal_ref:
            try:
                release_slot(db, int(p.deal_ref))
                released += 1
            except Exception:
                # continue processing others
                logger.exception("Failed to release slot for expired payment %s", p.id)
        db.add(p)
    db.commit()
    return released


def _serialize(payment: Payment) -> dict:
    return {
        "id": payment.id,
        "provider": payment.provider,
        "provider_order_id": payment.provider_order_id,
        "provider_payment_id": payment.provider_order_id,
        "status": payment.status,
        "amount": payment.amount,
        "currency": payment.currency,
        "idempotency_key": payment.idempotency_key,
        "client_secret": payment.client_secret,
        "error_code": payment.error_code,
        "error_message": payment.error_message,
    }


def reserve_slot(db: Session, ad_id: int) -> Ad:
    # lock the ad row to enforce first-come-first-serve on slots_remaining
    ad = (
        db.query(Ad)
        .filter(Ad.id == ad_id, Ad.status == "active")
        .with_for_update()
        .first()
    )
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not available", code="ad_not_found"),
        )
    if ad.slots_remaining <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Ad is filled", code="ad_filled"),
        )
    ad.slots_remaining -= 1
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad


def release_slot(db: Session, ad_id: int):
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if ad:
        ad.slots_remaining += 1
        db.add(ad)
        db.commit()
