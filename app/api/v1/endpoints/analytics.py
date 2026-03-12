import logging
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor
from app.models.analytics import OnboardingTrendResponse
from app.services.analytics import get_user_onboarding_trend
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
