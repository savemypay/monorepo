import logging
from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_customer
from app.models.payment import PaidUsersResponse, PaidUserEntry
from app.services.customer_purchases import list_customer_purchases
from app.utils.response import success_response

router = APIRouter(prefix="/customer", tags=["customer"])
logger = logging.getLogger(__name__)


@router.get("/purchases", status_code=status.HTTP_200_OK, response_model=PaidUsersResponse)
def get_purchases(
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_customer),
):
    customer_id = actor.get("user_id") or actor.get("sub")
    entries = list_customer_purchases(db, customer_id=str(customer_id))
    return success_response(message="Purchases fetched", data=entries)
