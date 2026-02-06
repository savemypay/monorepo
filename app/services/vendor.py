import logging
from sqlalchemy.orm import Session

from app.models.public import VendorCreate
from app.repositories.vendor_interest import VendorInterestRepository

logger = logging.getLogger(__name__)


def onboard_vendor(db: Session, payload: VendorCreate):
    logger.debug("Checking vendor uniqueness email=%s phone=%s", payload.email, payload.phone_number)
    existing = VendorInterestRepository.get_by_email_or_phone(
        db=db, email=payload.email, phone_number=payload.phone_number
    )
    if existing:
        logger.debug("Vendor conflict found id=%s email=%s", existing.id, existing.email)
        raise ValueError("Vendor with that email or phone already exists.")

    vendor = VendorInterestRepository.create(
        db=db,
        name=payload.name,
        email=payload.email,
        phone_number=payload.phone_number,
        category=payload.category,
        comments=payload.comments,
    )
    logger.debug("Vendor created id=%s", vendor.id)
    return vendor
