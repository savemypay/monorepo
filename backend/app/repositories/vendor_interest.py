import logging
from sqlalchemy.orm import Session

from app.entities.vendor import VendorInterest

logger = logging.getLogger(__name__)


class VendorInterestRepository:
    @staticmethod
    def get_by_email_or_phone(db: Session, email: str, phone_number: str) -> VendorInterest | None:
        logger.debug("Querying vendor interest by email/phone email=%s phone=%s", email, phone_number)
        return (
            db.query(VendorInterest)
            .filter((VendorInterest.email == email) | (VendorInterest.phone_number == phone_number))
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        name: str,
        email: str,
        phone_number: str,
        category: str,
        comments: str | None,
    ) -> VendorInterest:
        logger.debug("Persisting vendor interest email=%s phone=%s", email, phone_number)
        vendor = VendorInterest(
            name=name,
            email=email,
            phone_number=phone_number,
            category=category,
            comments=comments,
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
        logger.debug("Persisted vendor interest id=%s", vendor.id)
        return vendor
