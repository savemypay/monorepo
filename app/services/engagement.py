from __future__ import annotations

import hashlib
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, status
from sqlalchemy import String, and_, case, cast, func, literal
from sqlalchemy.orm import Session

from app.entities.ad import Ad
from app.entities.ad_interaction import AdInteraction
from app.entities.vendor_account import VendorAccount
from app.models.engagement import AdInteractionCaptureRequest
from app.utils.response import error_response

DEDUPE_WINDOW_SECONDS = 2


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _identity_expr():
    # Distinct identity for "unique users" across authenticated + anonymous traffic.
    return case(
        (AdInteraction.user_id.isnot(None), func.concat(literal("u:"), cast(AdInteraction.user_id, String))),
        (AdInteraction.session_id.isnot(None), func.concat(literal("s:"), AdInteraction.session_id)),
        else_=func.concat(literal("ip:"), func.coalesce(AdInteraction.ip_hash, literal("unknown"))),
    )


def _to_utc(value: datetime | None, fallback_now: bool = False) -> datetime | None:
    if value is None:
        return _now() if fallback_now else None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _build_scope_clause(
    *,
    role: str,
    actor: dict,
    vendor_id: int | None,
) -> tuple[int | None, list]:
    filters = []
    if role == "vendor":
        effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
        filters.append(AdInteraction.vendor_id == effective_vendor_id)
        return effective_vendor_id, filters

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Admin or vendor token required", code="invalid_token"),
        )

    if vendor_id is not None:
        filters.append(AdInteraction.vendor_id == vendor_id)
    return vendor_id, filters


def capture_ad_interaction(
    db: Session,
    *,
    ad_id: int,
    payload: AdInteractionCaptureRequest,
    actor: dict | None,
    request: Request,
) -> dict:
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not found", code="ad_not_found"),
        )

    actor_role = actor.get("role") if actor else None
    user_id: int | None = None
    if actor_role == "customer":
        user_value = actor.get("user_id") or actor.get("sub")
        user_id = int(user_value) if user_value is not None else None

    session_id = payload.session_id.strip() if payload.session_id else None
    if session_id == "":
        session_id = None
    client_ip = request.client.host if request.client else None
    ip_hash = hashlib.sha256(client_ip.encode("utf-8")).hexdigest() if client_ip else None
    user_agent = request.headers.get("user-agent")
    referrer = payload.referrer or request.headers.get("referer")
    occurred_at = _to_utc(payload.occurred_at, fallback_now=True)
    server_now = _now()

    dedupe_filters = [
        AdInteraction.ad_id == ad.id,
        AdInteraction.event_type == payload.event_type,
        AdInteraction.occurred_at >= (server_now - timedelta(seconds=DEDUPE_WINDOW_SECONDS)),
    ]
    can_dedupe = False
    if user_id is not None:
        dedupe_filters.append(AdInteraction.user_id == user_id)
        can_dedupe = True
    elif session_id is not None:
        dedupe_filters.append(AdInteraction.session_id == session_id)
        can_dedupe = True
    elif ip_hash is not None:
        dedupe_filters.append(AdInteraction.ip_hash == ip_hash)
        can_dedupe = True

    if can_dedupe:
        existing = db.query(AdInteraction).filter(and_(*dedupe_filters)).order_by(AdInteraction.id.desc()).first()
        if existing:
            return {
                "id": existing.id,
                "ad_id": existing.ad_id,
                "vendor_id": existing.vendor_id,
                "event_type": existing.event_type,
                "occurred_at": existing.occurred_at,
                "deduplicated": True,
            }

    interaction = AdInteraction(
        ad_id=ad.id,
        vendor_id=ad.vendor_id,
        user_id=user_id,
        session_id=session_id,
        event_type=payload.event_type,
        occurred_at=occurred_at,
        ip_hash=ip_hash,
        user_agent=user_agent,
        referrer=referrer,
        actor_role=actor_role,
        ad_title=ad.title,
        ad_product_name=ad.product_name,
        meta=payload.meta,
        created_by=f"{actor_role or 'anonymous'}_event",
    )
    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    return {
        "id": interaction.id,
        "ad_id": interaction.ad_id,
        "vendor_id": interaction.vendor_id,
        "event_type": interaction.event_type,
        "occurred_at": interaction.occurred_at,
        "deduplicated": False,
    }


def get_engagement_dashboard(
    db: Session,
    *,
    actor: dict,
    vendor_id: int | None,
    ad_id: int | None,
    event_type: str | None,
    date_from: datetime | None,
    date_to: datetime | None,
) -> dict:
    role = actor.get("role")
    effective_vendor_id, scope_filters = _build_scope_clause(role=role, actor=actor, vendor_id=vendor_id)
    date_from_utc = _to_utc(date_from) if date_from is not None else None
    date_to_utc = _to_utc(date_to) if date_to is not None else None

    if date_from_utc and date_to_utc and date_from_utc > date_to_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="date_from must be <= date_to", code="validation_error"),
        )

    query_filters = list(scope_filters)
    if ad_id is not None:
        query_filters.append(AdInteraction.ad_id == ad_id)
    if event_type is not None:
        query_filters.append(AdInteraction.event_type == event_type)
    if date_from_utc is not None:
        query_filters.append(AdInteraction.occurred_at >= date_from_utc)
    if date_to_utc is not None:
        query_filters.append(AdInteraction.occurred_at <= date_to_utc)

    base = db.query(AdInteraction).filter(and_(*query_filters)) if query_filters else db.query(AdInteraction)
    identity_expr = _identity_expr()
    views_expr = func.coalesce(func.sum(case((AdInteraction.event_type == "view", 1), else_=0)), 0)
    clicks_expr = func.coalesce(func.sum(case((AdInteraction.event_type == "click", 1), else_=0)), 0)
    cta_expr = func.coalesce(func.sum(case((AdInteraction.event_type == "cta_click", 1), else_=0)), 0)

    summary_row = (
        base.with_entities(
            func.count(AdInteraction.id),
            views_expr,
            clicks_expr,
            cta_expr,
            func.count(func.distinct(identity_expr)),
        ).one()
    )
    total_events, total_views, total_clicks, total_cta_clicks, unique_users = summary_row
    ctr = float(total_clicks / total_views) if total_views else 0.0

    by_ad_rows = (
        base.join(Ad, Ad.id == AdInteraction.ad_id)
        .with_entities(
            AdInteraction.ad_id,
            Ad.vendor_id,
            func.coalesce(Ad.title, AdInteraction.ad_title).label("ad_title"),
            func.count(AdInteraction.id).label("total_events"),
            views_expr.label("views"),
            clicks_expr.label("clicks"),
            cta_expr.label("cta_clicks"),
            func.count(func.distinct(identity_expr)).label("unique_users"),
        )
        .group_by(AdInteraction.ad_id, Ad.vendor_id, Ad.title, AdInteraction.ad_title)
        .order_by(func.count(AdInteraction.id).desc())
        .all()
    )
    by_ad = [
        {
            "ad_id": int(row.ad_id),
            "vendor_id": int(row.vendor_id),
            "ad_title": row.ad_title,
            "total_events": int(row.total_events or 0),
            "views": int(row.views or 0),
            "clicks": int(row.clicks or 0),
            "cta_clicks": int(row.cta_clicks or 0),
            "unique_users": int(row.unique_users or 0),
            "ctr": float((row.clicks or 0) / (row.views or 1)) if (row.views or 0) > 0 else 0.0,
        }
        for row in by_ad_rows
    ]

    by_vendor_rows = (
        base.join(VendorAccount, VendorAccount.id == AdInteraction.vendor_id)
        .with_entities(
            AdInteraction.vendor_id,
            VendorAccount.name.label("vendor_name"),
            func.count(AdInteraction.id).label("total_events"),
            views_expr.label("views"),
            clicks_expr.label("clicks"),
            cta_expr.label("cta_clicks"),
            func.count(func.distinct(identity_expr)).label("unique_users"),
        )
        .group_by(AdInteraction.vendor_id, VendorAccount.name)
        .order_by(func.count(AdInteraction.id).desc())
        .all()
    )
    by_vendor = [
        {
            "vendor_id": int(row.vendor_id),
            "vendor_name": row.vendor_name,
            "total_events": int(row.total_events or 0),
            "views": int(row.views or 0),
            "clicks": int(row.clicks or 0),
            "cta_clicks": int(row.cta_clicks or 0),
            "unique_users": int(row.unique_users or 0),
            "ctr": float((row.clicks or 0) / (row.views or 1)) if (row.views or 0) > 0 else 0.0,
        }
        for row in by_vendor_rows
    ]

    timeseries_rows = (
        base.with_entities(
            func.date(AdInteraction.occurred_at).label("date"),
            func.count(AdInteraction.id).label("total_events"),
            views_expr.label("views"),
            clicks_expr.label("clicks"),
            cta_expr.label("cta_clicks"),
            func.count(func.distinct(identity_expr)).label("unique_users"),
        )
        .group_by(func.date(AdInteraction.occurred_at))
        .order_by(func.date(AdInteraction.occurred_at).asc())
        .all()
    )
    timeseries = [
        {
            "date": str(row.date),
            "total_events": int(row.total_events or 0),
            "views": int(row.views or 0),
            "clicks": int(row.clicks or 0),
            "cta_clicks": int(row.cta_clicks or 0),
            "unique_users": int(row.unique_users or 0),
        }
        for row in timeseries_rows
    ]

    click_filters = list(scope_filters)
    click_filters.append(AdInteraction.event_type == "click")
    if ad_id is not None:
        click_filters.append(AdInteraction.ad_id == ad_id)
    if date_from_utc is not None:
        click_filters.append(AdInteraction.occurred_at >= date_from_utc)
    if date_to_utc is not None:
        click_filters.append(AdInteraction.occurred_at <= date_to_utc)

    click_identity_expr = case(
        (AdInteraction.user_id.isnot(None), func.concat(literal("user:"), cast(AdInteraction.user_id, String))),
        (AdInteraction.session_id.isnot(None), func.concat(literal("session:"), AdInteraction.session_id)),
        else_=func.concat(literal("anon:"), func.coalesce(AdInteraction.ip_hash, literal("unknown"))),
    )
    top_click_rows = (
        db.query(AdInteraction)
        .join(Ad, Ad.id == AdInteraction.ad_id)
        .filter(and_(*click_filters))
        .with_entities(
            AdInteraction.ad_id,
            func.coalesce(Ad.title, AdInteraction.ad_title).label("ad_title"),
            click_identity_expr.label("identity"),
            func.count(AdInteraction.id).label("click_count"),
        )
        .group_by(AdInteraction.ad_id, Ad.title, AdInteraction.ad_title, click_identity_expr)
        .order_by(func.count(AdInteraction.id).desc())
        .limit(100)
        .all()
    )
    top_user_ad_clicks = [
        {
            "ad_id": int(row.ad_id),
            "ad_title": row.ad_title,
            "identity": row.identity,
            "click_count": int(row.click_count or 0),
        }
        for row in top_click_rows
    ]

    return {
        "summary": {
            "total_events": int(total_events or 0),
            "total_views": int(total_views or 0),
            "total_clicks": int(total_clicks or 0),
            "total_cta_clicks": int(total_cta_clicks or 0),
            "unique_users": int(unique_users or 0),
            "ctr": ctr,
        },
        "by_vendor": by_vendor,
        "by_ad": by_ad,
        "timeseries": timeseries,
        "top_user_ad_clicks": top_user_ad_clicks,
        "applied_filters": {
            "role": role,
            "vendor_id": effective_vendor_id,
            "ad_id": ad_id,
            "event_type": event_type,
            "date_from": date_from_utc.isoformat() if date_from_utc else None,
            "date_to": date_to_utc.isoformat() if date_to_utc else None,
        },
    }
