import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.public import CustomerInterestCreate
from app.services.customer_interest import capture_customer_interest
from app.utils.response import success_response

router = APIRouter(prefix="/interest", tags=["public"])
logger = logging.getLogger(__name__)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_interest(payload: CustomerInterestCreate, db: Session = Depends(get_db)):
    logger.info("Received interest submission email=%s phone=%s", payload.email, payload.phone_number)
    interest = capture_customer_interest(db, payload)
    logger.info("Stored interest id=%s email=%s", interest.id, interest.email)
    return success_response(
        data={"id": interest.id, "email": interest.email},
        message="Customer interest recorded",
    )
