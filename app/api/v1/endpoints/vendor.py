import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.public import VendorCreate
from app.services.vendor import onboard_vendor
from app.utils.response import success_response, error_response

router = APIRouter(prefix="/vendors", tags=["public"])
logger = logging.getLogger(__name__)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_vendor(payload: VendorCreate, db: Session = Depends(get_db)):
    logger.info("Onboarding vendor email=%s phone=%s", payload.email, payload.phone_number)
    try:
        vendor = onboard_vendor(db, payload)
    except ValueError as exc:
        logger.warning("Vendor onboarding error email=%s phone=%s: %s", payload.email, payload.phone_number, exc)
        status_code = status.HTTP_409_CONFLICT if "exists" in str(exc) else status.HTTP_400_BAD_REQUEST
        raise HTTPException(
            status_code=status_code,
            detail=error_response(
                message="Vendor already exists" if status_code == status.HTTP_409_CONFLICT else "Invalid category",
                code="vendor_conflict" if status_code == status.HTTP_409_CONFLICT else "invalid_category",
                details=str(exc),
            ),
        ) from exc

    logger.info("Vendor onboarded id=%s email=%s", vendor.id, vendor.email)
    return success_response(
        data={
            "id": vendor.id,
            "email": vendor.email,
            "name": vendor.name,
            "category_id": vendor.category_id,
            "comments": vendor.comments,
        },
        message="Vendor onboarded",
    )
