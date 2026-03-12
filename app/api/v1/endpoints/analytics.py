import logging
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor
from app.models.analytics import (
    OnboardingTrendResponse,
    AdCategoryAnalyticsResponse,
    TransactionsAnalyticsResponse,
    DashboardOverviewResponse,
)
from app.services.analytics import (
    get_user_onboarding_trend,
    get_ads_by_category_analytics,
    get_transactions_trend,
    get_dashboard_overview_stats,
)
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/analytics", tags=["analytics"])
logger = logging.getLogger(__name__)


@router.get("/user-onboarding-trend", status_code=status.HTTP_200_OK, response_model=OnboardingTrendResponse)
def user_onboarding_trend(
    granularity: str = Query(default="day", pattern="^(day|week|month|year)$"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    role: str = Query(default="customer", pattern="^(customer|vendor)$"),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    if actor.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(message="Only admin can access analytics", code="forbidden"),
        )

    today = date.today()
    effective_to = date_to or today
    effective_from = date_from or (effective_to - timedelta(days=29))

    stats = get_user_onboarding_trend(
        db,
        granularity=granularity,  # type: ignore[arg-type]
        date_from=effective_from,
        date_to=effective_to,
        role=role,  # type: ignore[arg-type]
    )
    return success_response(message="User onboarding trend fetched", data=[stats])


@router.get("/ads-by-category", status_code=status.HTTP_200_OK, response_model=AdCategoryAnalyticsResponse)
def ads_by_category(
    category: str | None = Query(default=None),
    vendor_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor.get("role")
    if role == "vendor":
        effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    else:
        effective_vendor_id = vendor_id

    data = get_ads_by_category_analytics(
        db,
        category=category,
        vendor_id=effective_vendor_id,
    )
    return success_response(message="Ads category analytics fetched", data=[data])


@router.get("/transactions-trend", status_code=status.HTTP_200_OK, response_model=TransactionsAnalyticsResponse)
def transactions_trend(
    granularity: str = Query(default="day", pattern="^(day|week|month|year)$"),
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    vendor_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor.get("role")
    if role == "vendor":
        effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    else:
        effective_vendor_id = vendor_id

    today = date.today()
    effective_to = date_to or today
    effective_from = date_from or (effective_to - timedelta(days=29))

    data = get_transactions_trend(
        db,
        granularity=granularity,  # type: ignore[arg-type]
        date_from=effective_from,
        date_to=effective_to,
        vendor_id=effective_vendor_id,
    )
    return success_response(message="Transactions trend fetched", data=[data])


@router.get("/dashboard-overview", status_code=status.HTTP_200_OK, response_model=DashboardOverviewResponse)
def dashboard_overview(
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    if actor.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(message="Only admin can access analytics", code="forbidden"),
        )

    stats = get_dashboard_overview_stats(db, new_customers_window_days=15)
    return success_response(message="Dashboard overview fetched", data=[stats])
