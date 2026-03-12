import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor, get_current_customer, get_current_vendor_id
from app.entities.user import User
from app.entities.vendor_account import VendorAccount
from app.models.auth import (
    LoginRequest,
    OTPVerifyRequest,
    LoginResponse,
    VerifyResponse,
    LogoutRequest,
    ProfileUpdateRequest,
)
from app.models.admin import AdminLoginRequest, AdminLoginResponse, AdminUsersListResponse
from app.services.auth import issue_otp, verify_otp, logout
from app.services.admin_auth import admin_login, list_admin_users
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


@router.post("/customer/login", status_code=status.HTTP_200_OK, response_model=LoginResponse)
async def customer_login(payload: LoginRequest, db: Session = Depends(get_db)):
    ttl = await issue_otp(db, "customer", payload)
    logger.info("Customer login OTP sent identifier=%s", payload.identifier)
    return success_response(message="OTP sent", data=[{"expires_in_minutes": ttl}])


@router.post("/vendor/login", status_code=status.HTTP_200_OK, response_model=LoginResponse)
async def vendor_login(payload: LoginRequest, db: Session = Depends(get_db)):
    ttl = await issue_otp(db, "vendor", payload)
    logger.info("Vendor login OTP sent identifier=%s", payload.identifier)
    return success_response(message="OTP sent", data=[{"expires_in_minutes": ttl}])


@router.post("/customer/verify", status_code=status.HTTP_200_OK, response_model=VerifyResponse)
async def customer_verify(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    tokens = verify_otp(db, "customer", payload)
    logger.info("Customer OTP validated identifier=%s", payload.identifier)
    return success_response(message="OTP verified", data=[{"identifier": payload.identifier, **tokens}])


@router.post("/vendor/verify", status_code=status.HTTP_200_OK, response_model=VerifyResponse)
async def vendor_verify(payload: OTPVerifyRequest, db: Session = Depends(get_db)):
    tokens = verify_otp(db, "vendor", payload)
    logger.info("Vendor OTP validated identifier=%s", payload.identifier)
    return success_response(message="OTP verified", data=[{"identifier": payload.identifier, **tokens}])


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout_user(payload: LogoutRequest, db: Session = Depends(get_db)):
    logout(db, payload.refresh_token)
    logger.info("Logout succeeded for provided refresh token")
    return success_response(message="Logged out", data=[])


@router.post("/admin/login", status_code=status.HTTP_200_OK, response_model=AdminLoginResponse)
async def admin_login_endpoint(payload: AdminLoginRequest, db: Session = Depends(get_db)):
    tokens = admin_login(db, password=payload.password, username=payload.username, email=payload.email)
    logger.info("Admin login success username=%s email=%s", payload.username, payload.email)
    return success_response(message="Admin login", data=[tokens])


@router.get("/admin/users", status_code=status.HTTP_200_OK, response_model=AdminUsersListResponse)
async def admin_users_list(
    role: str = Query(default="all", pattern="^(all|customer|vendor)$"),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    if actor.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(message="Only admin can access this resource", code="forbidden"),
        )

    data = list_admin_users(db, role=role)  # type: ignore[arg-type]
    return success_response(message="Admin users fetched", data=[data])


@router.patch("/customer/profile", status_code=status.HTTP_200_OK)
async def update_customer_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_customer),
):
    user_id = int(actor.get("user_id") or actor.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="User not found", code="user_not_found"),
        )

    if payload.email is not None:
        email = payload.email.strip().lower()
        existing = (
            db.query(User.id)
            .filter(User.email == email, User.id != user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_response(message="Email already in use", code="email_conflict"),
            )
        user.email = email

    if payload.phone_number is not None:
        phone_number = payload.phone_number.strip()
        existing = (
            db.query(User.id)
            .filter(User.phone_number == phone_number, User.id != user.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_response(message="Phone number already in use", code="phone_conflict"),
            )
        user.phone_number = phone_number

    if payload.name is not None:
        user.name = payload.name.strip()

    user.updated_by = "customer_profile_update"
    db.add(user)
    db.commit()
    db.refresh(user)

    return success_response(
        message="Customer profile updated",
        data=[{
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
        }],
    )


@router.patch("/vendor/profile", status_code=status.HTTP_200_OK)
async def update_vendor_profile(
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    vendor_id: int = Depends(get_current_vendor_id),
):
    vendor = db.query(VendorAccount).filter(VendorAccount.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Vendor not found", code="vendor_not_found"),
        )

    if payload.email is not None:
        email = payload.email.strip().lower()
        existing = (
            db.query(VendorAccount.id)
            .filter(VendorAccount.email == email, VendorAccount.id != vendor.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_response(message="Email already in use", code="email_conflict"),
            )
        vendor.email = email

    if payload.phone_number is not None:
        phone_number = payload.phone_number.strip()
        existing = (
            db.query(VendorAccount.id)
            .filter(VendorAccount.phone_number == phone_number, VendorAccount.id != vendor.id)
            .first()
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_response(message="Phone number already in use", code="phone_conflict"),
            )
        vendor.phone_number = phone_number

    if payload.name is not None:
        vendor.name = payload.name.strip()

    vendor.updated_by = "vendor_profile_update"
    db.add(vendor)
    db.commit()
    db.refresh(vendor)

    return success_response(
        message="Vendor profile updated",
        data=[{
            "id": vendor.id,
            "name": vendor.name,
            "email": vendor.email,
            "phone_number": vendor.phone_number,
            "role": "vendor",
            "is_active": vendor.is_active,
            "category": vendor.category,
        }],
    )
