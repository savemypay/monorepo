import logging
from sqlalchemy.orm import Session

from app.entities.vendor_account import VendorAccount

logger = logging.getLogger(__name__)


class VendorAccountRepository:
    @staticmethod
    def get_by_email_or_phone(db: Session, email: str | None, phone_number: str | None) -> VendorAccount | None:
        query = db.query(VendorAccount)
        if email:
            query = query.filter(VendorAccount.email == email)
        if phone_number:
            query = query.filter(VendorAccount.phone_number == phone_number)
        return query.first()

    @staticmethod
    def upsert_basic(db: Session, email: str | None, phone_number: str | None) -> VendorAccount:
        vendor = VendorAccountRepository.get_by_email_or_phone(db, email, phone_number)
        if vendor:
            changed = False
            if email and not vendor.email:
                vendor.email = email
                changed = True
            if phone_number and not vendor.phone_number:
                vendor.phone_number = phone_number
                changed = True
            if not vendor.is_active:
                vendor.is_active = True
                changed = True
            if changed:
                db.add(vendor)
                db.commit()
                db.refresh(vendor)
            return vendor

        vendor = VendorAccount(
            email=email,
            phone_number=phone_number,
            is_active=True,
        )
        db.add(vendor)
        db.commit()
        db.refresh(vendor)
        return vendor
