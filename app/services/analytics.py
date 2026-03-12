from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.entities.user import User
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
