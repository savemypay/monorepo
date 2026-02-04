import logging
from sqlalchemy.orm import Session

from app.entities.customer_interest import CustomerInterest

logger = logging.getLogger(__name__)


class CustomerInterestRepository:
    @staticmethod
    def create(db: Session, email: str, phone_number: str | None, country_code: str | None) -> CustomerInterest:
        logger.debug("Persisting customer interest email=%s phone=%s", email, phone_number)
        interest = CustomerInterest(
            email=email,
            phone_number=phone_number,
            country_code=country_code,
        )
        db.add(interest)
        db.commit()
        db.refresh(interest)
        logger.debug("Persisted customer interest id=%s", interest.id)
        return interest
