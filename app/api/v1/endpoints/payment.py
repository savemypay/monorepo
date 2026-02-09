import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.core.config import PAYMENT_IDEMPOTENCY_HEADER
from app.models.payment import PaymentInitRequest, PaymentInitResponse
from app.services.payment import handle_webhook, initiate_payment
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
