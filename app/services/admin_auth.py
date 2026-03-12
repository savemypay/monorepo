from datetime import timedelta, datetime
import hashlib
import hmac
import secrets
from decimal import Decimal
from typing import Literal

from fastapi import HTTPException, status
from jose import jwt
from sqlalchemy import String, and_, cast, func, or_
from sqlalchemy.orm import Session, joinedload

from app.core.config import JWT_ACCESS_TOKEN_EXPIRE_MINUTES, JWT_ALGORITHM, JWT_SECRET_KEY, REFRESH_TOKEN_EXPIRE_DAYS, REFRESH_TOKEN_PEPPER
from app.entities.ad import Ad
from app.entities.admin_account import AdminAccount
from app.entities.payment import Payment
from app.entities.user import User
from app.entities.vendor_account import VendorAccount
from app.payments.base import PaymentStatus
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
    search: str | None = None,
) -> dict:
    customers: list[dict] = []
    vendors: list[dict] = []
    search_term = search.strip() if search else None
    pattern = f"%{search_term}%" if search_term else None

    if role in ("all", "customer"):
        q = db.query(User).filter(User.role == "customer")
        if pattern:
            q = q.filter(
                or_(
                    User.name.ilike(pattern),
                    User.email.ilike(pattern),
                    User.phone_number.ilike(pattern),
                )
            )
        rows = q.order_by(User.created_at.desc()).all()
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
        q = db.query(VendorAccount)
        if pattern:
            q = q.filter(
                or_(
                    VendorAccount.name.ilike(pattern),
                    VendorAccount.email.ilike(pattern),
                    VendorAccount.phone_number.ilike(pattern),
                    VendorAccount.category.ilike(pattern),
                )
            )
        rows = q.order_by(VendorAccount.created_at.desc()).all()
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


def _minor_to_major(amount_minor: int) -> float:
    return float(Decimal(int(amount_minor)) / Decimal("100"))


def get_vendor_ads_revenue(db: Session, *, vendor_id: int) -> dict:
    vendor = db.query(VendorAccount).filter(VendorAccount.id == vendor_id).first()
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Vendor not found", code="vendor_not_found"),
        )

    ads_rows = (
        db.query(Ad)
        .options(joinedload(Ad.tiers))
        .filter(Ad.vendor_id == vendor_id)
        .order_by(Ad.created_at.desc())
        .all()
    )
    revenue_rows = (
        db.query(
            Ad.id.label("ad_id"),
            func.coalesce(func.sum(Payment.amount), 0).label("revenue_minor"),
            func.count(Payment.id).label("successful_payments"),
        )
        .outerjoin(
            Payment,
            and_(
                cast(Ad.id, String) == Payment.deal_ref,
                Payment.status == PaymentStatus.SUCCEEDED,
            ),
        )
        .filter(Ad.vendor_id == vendor_id)
        .group_by(Ad.id)
        .all()
    )
    revenue_map = {
        int(row.ad_id): {
            "revenue_minor": int(row.revenue_minor or 0),
            "successful_payments": int(row.successful_payments or 0),
        }
        for row in revenue_rows
    }

    ads = []
    vendor_total_revenue_minor = 0
    for ad in ads_rows:
        stats = revenue_map.get(ad.id, {"revenue_minor": 0, "successful_payments": 0})
        vendor_total_revenue_minor += stats["revenue_minor"]
        ads.append(
            {
                "id": ad.id,
                "vendor_id": ad.vendor_id,
                "title": ad.title,
                "product_name": ad.product_name,
                "category": ad.category,
                "token_amount": float(ad.token_amount),
                "original_price": float(ad.original_price),
                "total_qty": ad.total_qty,
                "slots_remaining": ad.slots_remaining,
                "slots_sold": int(ad.total_qty - ad.slots_remaining),
                "status": ad.status,
                "description": ad.description,
                "terms": ad.terms,
                "valid_from": ad.valid_from,
                "valid_to": ad.valid_to,
                "is_favorite": False,
                "tiers": [
                    {
                        "id": tier.id,
                        "seq": tier.seq,
                        "qty": tier.qty,
                        "discount_pct": float(tier.discount_pct),
                        "label": tier.label,
                    }
                    for tier in ad.tiers
                ],
                "revenue_generated": _minor_to_major(stats["revenue_minor"]),
                "successful_payments": stats["successful_payments"],
            }
        )

    return {
        "vendor_id": vendor.id,
        "vendor_name": vendor.name,
        "vendor_email": vendor.email,
        "vendor_phone_number": vendor.phone_number,
        "total_ads": len(ads),
        "vendor_total_revenue": _minor_to_major(vendor_total_revenue_minor),
        "ads": ads,
    }
