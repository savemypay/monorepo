from calendar import monthrange
from datetime import date, datetime, time, timedelta, timezone
from typing import List, Optional
from decimal import Decimal

from sqlalchemy import Integer, String, cast, func, or_
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.entities.ad import Ad
from app.entities.payment import Payment
from app.entities.user import User
from app.payments.base import PaymentStatus
from app.utils.currency import minor_to_major
from app.utils.response import error_response


def _to_utc_start(d: date) -> datetime:
    return datetime.combine(d, time.min).replace(tzinfo=timezone.utc)


def _to_utc_end_exclusive(d: date) -> datetime:
    return datetime.combine(d + timedelta(days=1), time.min).replace(tzinfo=timezone.utc)


def _months_ago(d: date, months: int) -> date:
    month = d.month - months
    year = d.year
    while month <= 0:
        month += 12
        year -= 1
    day = min(d.day, monthrange(year, month)[1])
    return date(year, month, day)


def list_paid_users(
    db: Session,
    *,
    role: str,
    vendor_id: Optional[int],
    ad_id: Optional[int],
    page: int = 1,
    limit: int = 10,
    status_filter: Optional[str] = None,
    customer_id: Optional[int] = None,
    customer_search: Optional[str] = None,
) -> dict:
    effective_status = status_filter or PaymentStatus.SUCCEEDED
    q = db.query(Payment).filter(Payment.status == effective_status)

    if ad_id is not None:
        q = q.filter(Payment.deal_ref == str(ad_id))

    if role == "vendor":
        # restrict to payments whose deal_ref matches ads owned by this vendor
        q = (
            q.join(Ad, cast(Payment.deal_ref, Integer) == Ad.id)
            .filter(Ad.vendor_id == vendor_id)
        )

    if customer_id is not None:
        q = q.filter(Payment.customer_ref == str(customer_id))

    search_term = customer_search.strip() if customer_search else None
    if search_term:
        like_term = f"%{search_term}%"
        q = (
            q.outerjoin(User, cast(User.id, String) == Payment.customer_ref)
            .filter(
                or_(
                    Payment.customer_ref.ilike(like_term),
                    User.name.ilike(like_term),
                    User.email.ilike(like_term),
                    User.phone_number.ilike(like_term),
                )
            )
        )

    total_count = q.count()
    offset = (page - 1) * limit
    payments = q.order_by(Payment.created_at.desc()).offset(offset).limit(limit).all()

    # Fetch user details for customer_refs that look like ints
    user_ids = {int(p.customer_ref) for p in payments if p.customer_ref and p.customer_ref.isdigit()}
    users = (
        db.query(User)
        .filter(User.id.in_(user_ids))
        .all()
        if user_ids
        else []
    )
    user_map = {u.id: u for u in users}

    entries = [
        {
            "payment_id": p.id,
            "order_id": p.provider_order_id,
            "deal_ref": p.deal_ref,
            "customer_ref": p.customer_ref,
            "amount": p.amount,
            "amount_major": minor_to_major(p.amount, p.currency),
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
            "user_email": user_map.get(int(p.customer_ref)).email if p.customer_ref and p.customer_ref.isdigit() and int(p.customer_ref) in user_map else None,
            "user_phone_number": user_map.get(int(p.customer_ref)).phone_number if p.customer_ref and p.customer_ref.isdigit() and int(p.customer_ref) in user_map else None,
            "user_name": getattr(user_map.get(int(p.customer_ref)), "name", None) if p.customer_ref and p.customer_ref.isdigit() and int(p.customer_ref) in user_map else None,
        }
        for p in payments
    ]

    return {
        "page": page,
        "limit": limit,
        "total_count": total_count,
        "entries": entries,
    }


def list_customer_successful_transactions(
    db: Session,
    *,
    customer_id: str,
    date_from: date | None = None,
    date_to: date | None = None,
) -> List[dict]:
    today_utc = datetime.now(timezone.utc).date()
    effective_to = date_to or today_utc
    effective_from = date_from or _months_ago(effective_to, 6)

    if effective_from > effective_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="date_from must be <= date_to", code="validation_error"),
        )

    payments = (
        db.query(Payment)
        .join(Ad, cast(Ad.id, String) == Payment.deal_ref)
        .filter(
            Payment.status == PaymentStatus.SUCCEEDED,
            Payment.customer_ref == customer_id,
            Payment.created_at >= _to_utc_start(effective_from),
            Payment.created_at < _to_utc_end_exclusive(effective_to),
        )
        .order_by(Payment.created_at.desc())
        .all()
    )

    ad_ids = [int(p.deal_ref) for p in payments if p.deal_ref and p.deal_ref.isdigit()]
    ads = (
        db.query(Ad)
        .filter(Ad.id.in_(ad_ids))
        .all()
        if ad_ids
        else []
    )
    ad_map = {a.id: a for a in ads}

    user = None
    if customer_id.isdigit():
        user = db.query(User).filter(User.id == int(customer_id)).first()

    entries: list[dict] = []
    for p in payments:
        ad = ad_map.get(int(p.deal_ref)) if p.deal_ref and p.deal_ref.isdigit() else None
        entries.append(
            {
                "payment_id": p.id,
                "order_id": p.provider_order_id,
                "deal_ref": p.deal_ref,
                "customer_ref": p.customer_ref,
                "amount": p.amount,
                "amount_major": minor_to_major(p.amount, p.currency),
                "currency": p.currency,
                "status": p.status,
                "created_at": p.created_at,
                "ad": {
                    "id": ad.id,
                    "title": ad.title,
                    "product_name": ad.product_name,
                    "status": ad.status,
                    "valid_from": ad.valid_from,
                    "valid_to": ad.valid_to,
                    "images": ad.images,
                }
                if ad
                else None,
                "user_email": user.email if user else None,
                "user_phone_number": user.phone_number if user else None,
                "user_name": getattr(user, "name", None) if user else None,
            }
        )
    return entries


def get_dashboard_summary(db: Session, vendor_id: Optional[int]) -> dict:
    active_ads_q = db.query(func.count(Ad.id)).filter(Ad.status == "active")
    if vendor_id is not None:
        active_ads_q = active_ads_q.filter(Ad.vendor_id == vendor_id)
    active_ads = active_ads_q.scalar() or 0

    payments_q = (
        db.query(Payment)
        .join(Ad, cast(Ad.id, String) == Payment.deal_ref)
        .filter(Payment.status == PaymentStatus.SUCCEEDED)
    )
    if vendor_id is not None:
        payments_q = payments_q.filter(Ad.vendor_id == vendor_id)

    total_leads = (
        payments_q
        .filter(Payment.customer_ref.isnot(None))
        .with_entities(func.count(func.distinct(Payment.customer_ref)))
        .scalar()
        or 0
    )

    total_revenue_minor = payments_q.with_entities(func.coalesce(func.sum(Payment.amount), 0)).scalar() or 0
    total_revenue = float(Decimal(total_revenue_minor) / Decimal("100"))

    return {
        "active_ads": int(active_ads),
        "total_leads": int(total_leads),
        "total_revenue": total_revenue,
    }
