from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_customer
from app.core.config import PAYMENT_IDEMPOTENCY_HEADER
from app.models.payment import PaymentInitRequest, PaymentInitResponse
from app.services.payment import handle_webhook, initiate_payment, initiate_token_payment
from app.utils.response import success_response

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/initiate", status_code=status.HTTP_200_OK, response_model=PaymentInitResponse)
def initiate_payment_endpoint(
    payload: PaymentInitRequest,
    db: Annotated[Session, Depends(get_db)],
    idempotency_key: Annotated[
        Optional[str],
        Header(convert_underscores=False, alias=PAYMENT_IDEMPOTENCY_HEADER),
    ] = None,
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
async def payment_webhook(request: Request, db: Annotated[Session, Depends(get_db)]):
    raw_body = await request.body()
    headers = dict(request.headers)
    handle_webhook(db, raw_body=raw_body, headers=headers)
    return success_response(message="Webhook received", data=[])


@router.post("/token-pay/{ad_id}", status_code=status.HTTP_200_OK, response_model=PaymentInitResponse)
def token_payment(
    ad_id: int,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_customer)],
    idempotency_key: Annotated[
        Optional[str],
        Header(convert_underscores=False, alias=PAYMENT_IDEMPOTENCY_HEADER),
    ] = None,
):
    payment = initiate_token_payment(
        db,
        ad_id=ad_id,
        customer_ref=str(actor.get("user_id") or actor.get("sub")),
        customer_id=actor.get("user_id"),
        idempotency_key=idempotency_key,
    )
    return success_response(message="Token payment initiated", data=[payment])
