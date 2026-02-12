import logging
from typing import Optional

from decimal import Decimal

from fastapi import APIRouter, Depends, Header, Request, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_customer
from app.core.config import PAYMENT_IDEMPOTENCY_HEADER, PAYMENT_CURRENCY
from app.entities.ad import Ad
from app.models.payment import PaymentInitRequest, PaymentInitResponse
from app.services.payment import handle_webhook, initiate_payment, reserve_slot, release_slot
from app.utils.response import error_response, success_response
from app.utils.response import success_response

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


@router.post("/initiate", status_code=status.HTTP_200_OK, response_model=PaymentInitResponse)
def initiate_payment_endpoint(
    payload: PaymentInitRequest,
    db: Session = Depends(get_db),
    idempotency_key: Optional[str] = Header(default=None, convert_underscores=False, alias=PAYMENT_IDEMPOTENCY_HEADER),
):
    payment = initiate_payment(
        db,
        amount=payload.amount,
        currency=payload.currency,
        customer_ref=payload.customer_ref,
        deal_ref=payload.deal_ref,
        metadata=payload.metadata,
        idempotency_key=idempotency_key,
    )
    return success_response(message="Payment initiated", data=[payment])


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    raw_body = await request.body()
    headers = dict(request.headers)
    handle_webhook(db, raw_body=raw_body, headers=headers)
    return success_response(message="Webhook received", data=[])


@router.post("/token-pay/{ad_id}", status_code=status.HTTP_200_OK, response_model=PaymentInitResponse)
def token_payment(
    ad_id: int,
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_customer),
    idempotency_key: Optional[str] = Header(default=None, convert_underscores=False, alias=PAYMENT_IDEMPOTENCY_HEADER),
):
    # Reserve a slot atomically (locks row); release if payment fails to initiate
    ad = reserve_slot(db, ad_id)
    if ad.token_amount is None:
        release_slot(db, ad_id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Token amount not configured", code="token_missing"),
        )
    token_amount = ad.token_amount
    amount_minor = int(Decimal(token_amount) * 100)

    try:
        payment = initiate_payment(
            db,
            amount=amount_minor,
            currency=PAYMENT_CURRENCY,
            customer_ref=str(actor.get("user_id") or actor.get("sub")),
            deal_ref=str(ad.id),
            metadata={"ad_id": ad.id, "vendor_id": ad.vendor_id, "customer_id": actor.get("user_id")},
            idempotency_key=idempotency_key,
        )
    except Exception:
        release_slot(db, ad_id)
        raise

    return success_response(message="Token payment initiated", data=[payment])
