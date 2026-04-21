import logging
from sqlalchemy.orm import Session

from app.models.public import CustomerInterestCreate
from app.repositories.customer_interest import CustomerInterestRepository

logger = logging.getLogger(__name__)


def capture_customer_interest(db: Session, payload: CustomerInterestCreate):
    logger.debug("Creating customer interest email=%s phone=%s", payload.email, payload.phone_number)
    interest = CustomerInterestRepository.create(
        db=db,
        name=payload.name,
        email=payload.email,
        phone_number=payload.phone_number,
    )
    logger.debug("Created customer interest id=%s", interest.id)
    return interest
