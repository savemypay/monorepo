from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_customer
from app.core.config import PAYMENT_IDEMPOTENCY_HEADER
from app.models.payment import PaymentInitRequest, PaymentInitResponse, TokenPaymentRequest
from app.services.payment import handle_webhook, initiate_payment, initiate_token_payment
from app.utils.response import error_response, success_response

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
    payload: TokenPaymentRequest | None = None,
    idempotency_key: Annotated[
        Optional[str],
        Header(convert_underscores=False, alias=PAYMENT_IDEMPOTENCY_HEADER),
    ] = None,
):
    customer_raw_id = actor.get("user_id") or actor.get("sub")
    if customer_raw_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Token missing user_id", code="invalid_token"),
        )
    try:
        customer_id = int(customer_raw_id)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Invalid user_id in token", code="invalid_token"),
        ) from exc

    payment = initiate_token_payment(
        db,
        ad_id=ad_id,
        customer_ref=str(customer_id),
        customer_id=customer_id,
        metadata=payload.metadata if payload else {},
        idempotency_key=idempotency_key,
    )
    return success_response(message="Token payment initiated", data=[payment])
