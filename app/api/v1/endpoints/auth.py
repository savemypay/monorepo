import logging

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.models.auth import LoginRequest, OTPVerifyRequest, LoginResponse, VerifyResponse, LogoutRequest
from app.models.admin import AdminLoginRequest, AdminLoginResponse
from app.services.auth import issue_otp, verify_otp, logout
from app.services.admin_auth import admin_login
from app.utils.response import success_response

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
    tokens = admin_login(db, payload.username, payload.password)
    logger.info("Admin login success username=%s", payload.username)
    return success_response(message="Admin login", data=[tokens])
