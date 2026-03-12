from datetime import timedelta, datetime
import hashlib
import hmac
import secrets
from typing import Literal

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session

from app.core.config import JWT_ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM, JWT_SECRET_KEY, REFRESH_TOKEN_EXPIRE_DAYS, REFRESH_TOKEN_PEPPER
from app.entities.admin_account import AdminAccount
from app.entities.user import User
from app.entities.vendor_account import VendorAccount
from app.utils.response import error_response


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _verify_password(password: str, hashed: str) -> bool:
    return hmac.compare_digest(_hash_password(password), hashed)


def admin_login(db: Session, password: str, username: str | None = None, email: str | None = None) -> dict:
    q = db.query(AdminAccount).filter(AdminAccount.is_active.is_(True))
    if email:
        admin = q.filter(AdminAccount.email == email.lower().strip()).first()
    elif username:
        admin = q.filter(AdminAccount.username == username).first()
    else:
        admin = None

    if not admin or not _verify_password(password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Invalid credentials", code="invalid_credentials"),
        )

    expires_delta = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    expire_at = datetime.utcnow() + expires_delta
    payload = {
        "sub": str(admin.id),
        "user_id": str(admin.id),
        "role": "admin",
        "username": admin.username,
        "email": admin.email,
        "exp": expire_at,
    }
    access_token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

    refresh_token = secrets.token_urlsafe(48)
    refresh_expires_in = int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds())

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": "admin",
        "user_id": str(admin.id),
    }


def list_admin_users(
    db: Session,
    *,
    role: Literal["all", "customer", "vendor"] = "all",
) -> dict:
    customers: list[dict] = []
    vendors: list[dict] = []

    if role in ("all", "customer"):
        rows = (
            db.query(User)
            .filter(User.role == "customer")
            .order_by(User.created_at.desc())
            .all()
        )
        customers = [
            {
                "id": row.id,
                "role": "customer",
                "name": row.name,
                "email": row.email,
                "phone_number": row.phone_number,
                "is_active": bool(row.is_active),
                "created_at": row.created_at,
            }
            for row in rows
        ]

    if role in ("all", "vendor"):
        rows = (
            db.query(VendorAccount)
            .order_by(VendorAccount.created_at.desc())
            .all()
        )
        vendors = [
            {
                "id": row.id,
                "role": "vendor",
                "name": row.name,
                "email": row.email,
                "phone_number": row.phone_number,
                "is_active": bool(row.is_active),
                "created_at": row.created_at,
            }
            for row in rows
        ]

    total_customers = len(customers) if role in ("all", "customer") else 0
    total_vendors = len(vendors) if role in ("all", "vendor") else 0

    return {
        "role_filter": role,
        "total_customers": total_customers,
        "total_vendors": total_vendors,
        "total_count": total_customers + total_vendors,
        "customers": customers,
        "vendors": vendors,
    }
