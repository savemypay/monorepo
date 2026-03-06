import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_user
from app.entities.user import User
from app.entities.vendor_account import VendorAccount
from app.utils.response import success_response, error_response
from fastapi import HTTPException

router = APIRouter(prefix="/profile", tags=["profile"])
logger = logging.getLogger(__name__)


@router.get("", status_code=status.HTTP_200_OK)
def get_profile(db: Session = Depends(get_db), actor: dict = Depends(get_current_user)):
    role = actor.get("role")
    if role == "customer":
        user = db.query(User).filter(User.id == int(actor.get("user_id") or actor.get("sub"))).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_response(message="User not found", code="user_not_found"),
            )
        data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
            "is_active": user.is_active,
            "referral_points": int(user.referral_points or 0),
            "referral_code": user.referral_code,
            "referred_by_user_id": user.referred_by_user_id,
            "referred_at": user.referred_at,
        }
    else:
        vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
        vendor = db.query(VendorAccount).filter(VendorAccount.id == vendor_id).first()
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_response(message="Vendor not found", code="vendor_not_found"),
            )
        data = {
            "id": vendor.id,
            "email": vendor.email,
            "phone_number": vendor.phone_number,
            "role": "vendor",
            "is_active": vendor.is_active,
            "category": vendor.category,
            "name": vendor.name,
        }
    return success_response(message="Profile fetched", data=[data])
