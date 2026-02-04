import logging
from sqlalchemy.orm import Session

from app.models.public import VendorCreate
from app.repositories.vendor import VendorRepository
from app.repositories.category import CategoryRepository

logger = logging.getLogger(__name__)


def onboard_vendor(db: Session, payload: VendorCreate):
    logger.debug("Checking vendor uniqueness email=%s phone=%s", payload.email, payload.phone_number)
    existing = VendorRepository.get_by_email_or_phone(
        db=db, email=payload.email, phone_number=payload.phone_number
    )
    if existing:
        logger.debug("Vendor conflict found id=%s email=%s", existing.id, existing.email)
        raise ValueError("Vendor with that email or phone already exists.")

    category = CategoryRepository.get_by_id(db, payload.category_id)
    if not category:
        logger.debug("Category not found id=%s", payload.category_id)
        raise ValueError("Invalid category_id")

    vendor = VendorRepository.create(
        db=db,
        name=payload.name,
        email=payload.email,
        phone_number=payload.phone_number,
        country_code=payload.country_code,
        address=payload.address,
        category_id=payload.category_id,
        comments=payload.comments,
    )
    logger.debug("Vendor created id=%s", vendor.id)
    return vendor
