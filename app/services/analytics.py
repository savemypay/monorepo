from collections import defaultdict
from decimal import Decimal
from datetime import date, datetime, time, timedelta, timezone
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy import Integer, String, cast, func
from sqlalchemy.orm import Session

from app.entities.ad import Ad
from app.entities.payment import Payment
from app.entities.user import User
from app.entities.vendor_account import VendorAccount
from app.payments.base import PaymentStatus
from app.utils.response import error_response

Granularity = Literal["day", "week", "month", "year"]
UserRole = Literal["customer", "vendor"]


def _to_utc_start(d: date) -> datetime:
    return datetime.combine(d, time.min).replace(tzinfo=timezone.utc)


def _to_utc_end_exclusive(d: date) -> datetime:
    return datetime.combine(d + timedelta(days=1), time.min).replace(tzinfo=timezone.utc)


def _bucket_start(value: datetime, granularity: Granularity) -> date:
    dt = value.astimezone(timezone.utc)
    if granularity == "day":
        return dt.date()
    day_value = dt.date()
    if granularity == "week":
        # ISO week starts on Monday.
        return day_value - timedelta(days=day_value.weekday())
    if granularity == "month":
        return day_value.replace(day=1)
    # year
    return day_value.replace(month=1, day=1)


def _next_bucket(current: date, granularity: Granularity) -> date:
    if granularity == "day":
        return current + timedelta(days=1)
    if granularity == "week":
        return current + timedelta(days=7)
    if granularity == "month":
        if current.month == 12:
            return date(current.year + 1, 1, 1)
        return date(current.year, current.month + 1, 1)
    # year
    return date(current.year + 1, 1, 1)


def _bucket_end(bucket_start: date, granularity: Granularity, date_to: date) -> date:
    if granularity == "day":
        return bucket_start
    if granularity == "week":
        return min(bucket_start + timedelta(days=6), date_to)
    if granularity == "month":
        next_month = _next_bucket(bucket_start, "month")
        return min(next_month - timedelta(days=1), date_to)
    # year
    next_year = _next_bucket(bucket_start, "year")
    return min(next_year - timedelta(days=1), date_to)


def _align_cursor_start(d: date, granularity: Granularity) -> date:
    if granularity == "day":
        return d
    if granularity == "week":
        return d - timedelta(days=d.weekday())
    if granularity == "month":
        return d.replace(day=1)
    return d.replace(month=1, day=1)


def get_user_onboarding_trend(
    db: Session,
    *,
    granularity: Granularity,
    date_from: date,
    date_to: date,
    role: UserRole,
) -> dict:
    if date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="date_from must be <= date_to", code="validation_error"),
        )

    range_start = _to_utc_start(date_from)
    range_end_exclusive = _to_utc_end_exclusive(date_to)

    base_count = (
        db.query(User.id)
        .filter(
            User.role == role,
            User.created_at < range_start,
        )
        .count()
    )

    rows = (
        db.query(User.created_at)
        .filter(
            User.role == role,
            User.created_at >= range_start,
            User.created_at < range_end_exclusive,
        )
        .all()
    )

    bucket_counts: dict[date, int] = defaultdict(int)
    for (created_at,) in rows:
        if created_at is None:
            continue
        bucket_counts[_bucket_start(created_at, granularity)] += 1

    trend: list[dict] = []
    running_total = int(base_count)
    cursor = _align_cursor_start(date_from, granularity)

    while cursor <= date_to:
        new_users = int(bucket_counts.get(cursor, 0))
        running_total += new_users
        trend.append(
            {
                "period_start": cursor.isoformat(),
                "period_end": _bucket_end(cursor, granularity, date_to).isoformat(),
                "new_users": new_users,
                "cumulative_users": running_total,
            }
        )
        cursor = _next_bucket(cursor, granularity)

    return {
        "granularity": granularity,
        "role": role,
        "date_from": date_from.isoformat(),
        "date_to": date_to.isoformat(),
        "total_new_users": sum(item["new_users"] for item in trend),
        "total_users_till_to_date": running_total,
        "trend": trend,
    }


def get_ads_by_category_analytics(
    db: Session,
    *,
    category: str | None = None,
    vendor_id: int | None = None,
) -> dict:
    q = db.query(Ad)
    normalized_category = category.strip() if category else None

    if vendor_id is not None:
        q = q.filter(Ad.vendor_id == vendor_id)
    if normalized_category:
        q = q.filter(Ad.category.ilike(normalized_category))

    grouped_rows = (
        q.with_entities(
            Ad.category,
            func.count(Ad.id).label("ads_count"),
        )
        .group_by(Ad.category)
        .order_by(func.count(Ad.id).desc(), Ad.category.asc())
        .all()
    )

    by_category = [
        {
            "category": row.category or "",
            "ads_count": int(row.ads_count or 0),
        }
        for row in grouped_rows
    ]

    return {
        "category_filter": normalized_category,
        "vendor_id": vendor_id,
        "total_ads": sum(item["ads_count"] for item in by_category),
        "by_category": by_category,
    }


def _minor_to_major(amount_minor: int) -> float:
    return float(Decimal(int(amount_minor)) / Decimal("100"))


def get_transactions_trend(
    db: Session,
    *,
    granularity: Granularity,
    date_from: date,
    date_to: date,
    vendor_id: int | None = None,
) -> dict:
    if date_from > date_to:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="date_from must be <= date_to", code="validation_error"),
        )

    range_start = _to_utc_start(date_from)
    range_end_exclusive = _to_utc_end_exclusive(date_to)

    q = (
        db.query(Payment.created_at, Payment.amount, Payment.customer_ref)
        .filter(
            Payment.status == PaymentStatus.SUCCEEDED,
            Payment.created_at >= range_start,
            Payment.created_at < range_end_exclusive,
        )
    )
    if vendor_id is not None:
        q = (
            q.join(Ad, cast(Ad.id, String) == Payment.deal_ref)
            .filter(Ad.vendor_id == vendor_id)
        )

    rows = q.all()

    bucket_counts: dict[date, dict] = defaultdict(
        lambda: {"transactions_count": 0, "amount_minor": 0, "users": set()}
    )
    unique_users_total: set[str] = set()

    for created_at, amount, customer_ref in rows:
        if created_at is None:
            continue
        bucket_key = _bucket_start(created_at, granularity)
        bucket_counts[bucket_key]["transactions_count"] += 1
        bucket_counts[bucket_key]["amount_minor"] += int(amount or 0)
        if customer_ref:
            key = str(customer_ref).strip()
            if key:
                bucket_counts[bucket_key]["users"].add(key)
                unique_users_total.add(key)

    trend: list[dict] = []
    cumulative_minor = 0
    cursor = _align_cursor_start(date_from, granularity)
    while cursor <= date_to:
        bucket = bucket_counts.get(cursor)
        tx_count = int(bucket["transactions_count"]) if bucket else 0
        amount_minor = int(bucket["amount_minor"]) if bucket else 0
        users_count = len(bucket["users"]) if bucket else 0
        cumulative_minor += amount_minor
        trend.append(
            {
                "period_start": cursor.isoformat(),
                "period_end": _bucket_end(cursor, granularity, date_to).isoformat(),
                "transactions_count": tx_count,
                "unique_paying_users": users_count,
                "paid_amount": _minor_to_major(amount_minor),
                "cumulative_paid_amount": _minor_to_major(cumulative_minor),
            }
        )
        cursor = _next_bucket(cursor, granularity)

    total_amount_minor = sum(int(row.amount or 0) for row in rows)

    return {
        "granularity": granularity,
        "date_from": date_from.isoformat(),
        "date_to": date_to.isoformat(),
        "vendor_id": vendor_id,
        "total_transactions": len(rows),
        "total_unique_paying_users": len(unique_users_total),
        "total_paid_amount": _minor_to_major(total_amount_minor),
        "trend": trend,
    }


def get_dashboard_overview_stats(
    db: Session,
    *,
    new_customers_window_days: int = 15,
) -> dict:
    today_utc = datetime.now(timezone.utc).date()
    today_start = _to_utc_start(today_utc)
    tomorrow_start = _to_utc_end_exclusive(today_utc)

    live_deals = (
        db.query(func.count(Ad.id))
        .filter(Ad.status == "active")
        .scalar()
        or 0
    )

    pending_approval = (
        db.query(func.count(Ad.id))
        .filter(Ad.status == "draft")
        .scalar()
        or 0
    )

    collections_today_minor = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(
            Payment.status == PaymentStatus.SUCCEEDED,
            Payment.created_at >= today_start,
            Payment.created_at < tomorrow_start,
        )
        .scalar()
        or 0
    )

    active_vendors = (
        db.query(func.count(VendorAccount.id))
        .filter(VendorAccount.is_active.is_(True))
        .scalar()
        or 0
    )

    window_days = max(int(new_customers_window_days), 1)
    customers_from_date = today_utc - timedelta(days=window_days - 1)
    customers_from_start = _to_utc_start(customers_from_date)
    new_customers = (
        db.query(func.count(User.id))
        .filter(
            User.role == "customer",
            User.created_at >= customers_from_start,
            User.created_at < tomorrow_start,
        )
        .scalar()
        or 0
    )

    failed_payments = (
        db.query(func.count(Payment.id))
        .filter(Payment.status == PaymentStatus.FAILED)
        .scalar()
        or 0
    )

    return {
        "live_deals": int(live_deals),
        "pending_approval": int(pending_approval),
        "collections_today": _minor_to_major(int(collections_today_minor)),
        "active_vendors": int(active_vendors),
        "new_customers": int(new_customers),
        "failed_payments": int(failed_payments),
        "new_customers_window_days": int(window_days),
    }
