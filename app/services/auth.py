from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
from typing import Literal

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import (
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_SECRET_KEY,
    OTP_CODE_LENGTH,
    OTP_MAX_ATTEMPTS,
    OTP_PEPPER,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_TTL_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    REFRESH_TOKEN_PEPPER,
)
from app.entities.customer_interest import CustomerInterest
from app.entities.login_otp import LoginOtp
from app.entities.user import User
from app.entities.refresh_token import RefreshToken
from app.entities.vendor import VendorInterest
from app.entities.vendor_account import VendorAccount
from app.entities.admin_account import AdminAccount
from app.entities.vendor_refresh_token import VendorRefreshToken
from app.models.auth import LoginRequest, OTPVerifyRequest
from app.notifications.notifier import send_email_async, send_sms_async
from app.utils.response import error_response

Audience = Literal["customer", "vendor"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _hash_code(code: str) -> str:
    key = OTP_PEPPER.encode("utf-8")
    return hmac.new(key, msg=code.encode("utf-8"), digestmod=hashlib.sha256).hexdigest()


def _verify_hash(code: str, hashed: str) -> bool:
    key = OTP_PEPPER.encode("utf-8")
    candidate = hmac.new(key, msg=code.encode("utf-8"), digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(candidate, hashed)


def _generate_code(length: int) -> str:
    upper = 10**length
    return f"{secrets.randbelow(upper):0{length}d}"


def _hash_refresh(token: str) -> str:
    key = REFRESH_TOKEN_PEPPER.encode("utf-8")
    return hmac.new(key, msg=token.encode("utf-8"), digestmod=hashlib.sha256).hexdigest()


def _create_access_token(user: User) -> tuple[str, int]:
    expires_delta = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire_at = _now() + expires_delta
    payload = {
        "sub": str(user.id),
        "user_id": str(user.id),
        "exp": expire_at,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
    }
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return token, int(expires_delta.total_seconds())


def _create_refresh_token(user: User) -> tuple[str, int, datetime]:
    token = secrets.token_urlsafe(48)
    ttl = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    expires_at = _now() + ttl
    return token, int(ttl.total_seconds()), expires_at


def _get_identifier(payload: LoginRequest | OTPVerifyRequest) -> str:
    payload.require_identifier()
    return payload.identifier


def _latest_active(db: Session, audience: Audience, identifier: str) -> LoginOtp | None:
    now = _now()
    return (
        db.query(LoginOtp)
        .filter(
            LoginOtp.audience == audience,
            LoginOtp.identifier == identifier,
            LoginOtp.expires_at > now,
            LoginOtp.consumed_at.is_(None),
        )
        .order_by(LoginOtp.created_at.desc())
        .first()
    )


def _revoke_previous_active(db: Session, audience: Audience, identifier: str, timestamp: datetime) -> None:
    db.query(LoginOtp).filter(
        LoginOtp.audience == audience,
        LoginOtp.identifier == identifier,
        LoginOtp.consumed_at.is_(None),
    ).update({LoginOtp.consumed_at: timestamp}, synchronize_session=False)


async def issue_otp(db: Session, audience: Audience, payload: LoginRequest) -> int:
    identifier = _get_identifier(payload)

    now = _now()
    existing = _latest_active(db, audience, identifier)
    if existing and (now - existing.created_at).total_seconds() < OTP_RESEND_COOLDOWN_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=error_response(
                message="Please wait before requesting another OTP",
                code="otp_throttled",
                details={"retry_after_seconds": OTP_RESEND_COOLDOWN_SECONDS},
            ),
        )

    # Create new OTP
    code = _generate_code(OTP_CODE_LENGTH)
    code="123456" # for time being.
    _revoke_previous_active(db, audience, identifier, now)
    otp = LoginOtp(
        audience=audience,
        identifier=identifier,
        code_hash=_hash_code(code),
        expires_at=now + timedelta(minutes=OTP_TTL_MINUTES),
        attempts=0,
        max_attempts=OTP_MAX_ATTEMPTS,
    )
    db.add(otp)
    db.commit()

    message = f"Your login code is {code}. It expires in {OTP_TTL_MINUTES} minutes."
    if payload.email:
        pass
        # await send_email_async(
        #     to=payload.email,
        #     subject="Your login code",
        #     body_text=message,
        #     body_html=None,
        # )
    elif payload.phone_number:
        pass
        # await send_sms_async(to=payload.phone_number, message=message)

    return OTP_TTL_MINUTES


def _get_latest_or_error(db: Session, audience: Audience, identifier: str) -> LoginOtp:
    otp = (
        db.query(LoginOtp)
        .filter(
            LoginOtp.audience == audience,
            LoginOtp.identifier == identifier,
        )
        .order_by(LoginOtp.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="No active OTP. Please request a new code.", code="otp_missing"),
        )
    return otp


def verify_otp(db: Session, audience: Audience, payload: OTPVerifyRequest) -> dict:
    identifier = _get_identifier(payload)
    otp = _get_latest_or_error(db, audience, identifier)
    now = _now()

    if otp.consumed_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="OTP already used. Please request a new code.", code="otp_used"),
        )
    if otp.expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="OTP expired. Please request a new code.", code="otp_expired"),
        )
    if otp.attempts >= otp.max_attempts:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=error_response(message="Too many attempts. Request a new code.", code="otp_locked"),
        )
    if not _verify_hash(payload.code, otp.code_hash):
        otp.attempts += 1
        db.add(otp)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Invalid OTP.", code="otp_invalid"),
        )

    otp.consumed_at = now
    otp.attempts += 1
    db.add(otp)
    db.commit()

    if audience == "vendor":
        vendor, is_new = _ensure_vendor_account(db, payload)
        tokens = _issue_tokens_vendor(db, vendor, is_new)
        return tokens
    else:
        user, is_new = _ensure_user_record(db, payload, audience)
        tokens = _issue_tokens_customer(db, user, is_new)
        return tokens


def _ensure_user_record(db: Session, payload: LoginRequest | OTPVerifyRequest, audience: Audience) -> tuple[User, bool]:
    """Create or update a User row after successful OTP verification."""
    identifier = payload.identifier
    user: User | None = None

    if payload.email:
        user = db.query(User).filter(User.email == payload.email).first()
    if not user and payload.phone_number:
        user = db.query(User).filter(User.phone_number == payload.phone_number).first()

    # Generate a placeholder secret so hashed_password is non-null.
    placeholder_secret = secrets.token_hex(32)
    placeholder_hash = hashlib.sha256(placeholder_secret.encode("utf-8")).hexdigest()

    desired_role = "vendor" if audience == "vendor" else "customer"

    is_new = False

    if user:
        changed = False
        if payload.email and not user.email:
            user.email = payload.email
            changed = True
        if payload.phone_number and not user.phone_number:
            user.phone_number = payload.phone_number
            changed = True
        if not user.is_active:
            user.is_active = True
            changed = True
        if user.role != desired_role:
            user.role = desired_role
            changed = True
        if changed:
            db.add(user)
            db.commit()
            db.refresh(user)
        return user, is_new

    user = User(
        email=payload.email,
        phone_number=payload.phone_number,
        hashed_password=placeholder_hash,
        is_active=True,
        role=desired_role,
        created_by=audience,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    is_new = True
    return user, is_new


def _ensure_vendor_account(db: Session, payload: LoginRequest | OTPVerifyRequest) -> tuple[VendorAccount, bool]:
    vendor = db.query(VendorAccount)
    if payload.email:
        vendor = vendor.filter(VendorAccount.email == payload.email)
    if payload.phone_number:
        vendor = vendor.filter(VendorAccount.phone_number == payload.phone_number)
    vendor = vendor.first()

    is_new = False

    if vendor:
        changed = False
        if payload.email and not vendor.email:
            vendor.email = payload.email
            changed = True
        if payload.phone_number and not vendor.phone_number:
            vendor.phone_number = payload.phone_number
            changed = True
        if not vendor.is_active:
            vendor.is_active = True
            changed = True
        if changed:
            db.add(vendor)
            db.commit()
            db.refresh(vendor)
        return vendor, is_new

    vendor = VendorAccount(
        email=payload.email,
        phone_number=payload.phone_number,
        is_active=True,
        role="vendor",
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    is_new = True
    return vendor, is_new


def _issue_tokens_customer(db: Session, user: User, is_new: bool) -> dict:
    access_token, access_expires_in = _create_access_token(user)
    refresh_token, refresh_expires_in, refresh_exp_at = _create_refresh_token(user)

    rt = RefreshToken(
        user_id=user.id,
        token_hash=_hash_refresh(refresh_token),
        expires_at=refresh_exp_at,
        revoked_at=None,
    )
    db.add(rt)
    db.commit()

    return {
        "access_token": access_token,
        "access_token_expires_in": access_expires_in,
        "refresh_token": refresh_token,
        "refresh_token_expires_in": refresh_expires_in,
        "token_type": "bearer",
        "role": user.role,
        "user_id": str(user.id),
        "is_new_user": is_new,
        "user": {
            "id": user.id,
            "email": user.email,
            "phone_number": user.phone_number,
            "is_active": user.is_active,
        },
    }


def _issue_tokens_vendor(db: Session, vendor: VendorAccount, is_new: bool) -> dict:
    # For vendors, issue tokens with vendor id as subject
    expires_delta = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire_at = _now() + expires_delta
    payload = {
        "sub": str(vendor.id),
        "vendor_id": str(vendor.id),
        "user_id": str(vendor.id),
        "exp": expire_at,
        "email": vendor.email,
        "phone_number": vendor.phone_number,
        "role": "vendor",
    }
    access_token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    access_expires_in = int(expires_delta.total_seconds())

    refresh_token = secrets.token_urlsafe(48)
    ttl = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_expires_in = int(ttl.total_seconds())
    refresh_exp_at = _now() + ttl

    vrt = VendorRefreshToken(
        vendor_id=vendor.id,
        token_hash=_hash_refresh(refresh_token),
        expires_at=refresh_exp_at,
        revoked_at=None,
    )
    db.add(vrt)
    db.commit()

    return {
        "access_token": access_token,
        "access_token_expires_in": access_expires_in,
        "refresh_token": refresh_token,
        "refresh_token_expires_in": refresh_expires_in,
        "token_type": "bearer",
        "role": "vendor",
        "user_id": str(vendor.id),
        "vendor_id": str(vendor.id),
        "is_new_user": is_new,
        "vendor": {
            "id": vendor.id,
            "email": vendor.email,
            "phone_number": vendor.phone_number,
            "is_active": vendor.is_active,
        },
    }


def logout(db: Session, refresh_token: str) -> None:
    token_hash = _hash_refresh(refresh_token)
    rt = (
        db.query(RefreshToken)
        .filter(RefreshToken.token_hash == token_hash, RefreshToken.revoked_at.is_(None))
        .first()
    )
    vrt = (
        db.query(VendorRefreshToken)
        .filter(VendorRefreshToken.token_hash == token_hash, VendorRefreshToken.revoked_at.is_(None))
        .first()
    )
    target = rt or vrt
    if not target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Invalid refresh token", code="invalid_token"),
        )
    now = _now()
    target.revoked_at = now
    db.add(target)
    db.commit()
