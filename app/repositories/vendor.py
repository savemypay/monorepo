import logging
from sqlalchemy.orm import Session

from app.entities.vendor import Vendor

logger = logging.getLogger(__name__)


class VendorRepository:
    @staticmethod
    def get_by_email_or_phone(db: Session, email: str, phone_number: str) -> Vendor | None:
        logger.debug("Querying vendor by email/phone email=%s phone=%s", email, phone_number)
        return (
            db.query(Vendor)
            .filter((Vendor.email == email) | (Vendor.phone_number == phone_number))
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        name: str,
        email: str,
        phone_number: str,
        country_code: str | None,
        address: str | None,
    ) -> Vendor:
        logger.debug("Persisting vendor email=%s phone=%s", email, phone_number)
        vendor = Vendor(
            name=name,
            email=email,
            phone_number=phone_number,
            country_code=country_code,
            address=address,
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
        logger.debug("Persisted vendor id=%s", vendor.id)
        return vendor
