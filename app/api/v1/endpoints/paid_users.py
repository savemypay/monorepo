import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor
from app.models.payment import DashboardSummaryResponse, PaidUsersResponse
from app.services.paid_users import get_dashboard_summary, list_paid_users
from app.utils.response import success_response

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


@router.get("/paid-users", status_code=status.HTTP_200_OK, response_model=PaidUsersResponse)
def get_paid_users(
    ad_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor["role"]
    vendor_id = int(actor.get("vendor_id") or actor.get("sub")) if role == "vendor" else None
    entries = list_paid_users(db, role=role, vendor_id=vendor_id, ad_id=ad_id)
    return success_response(message="Paid users fetched", data=entries)


@router.get("/dashboard-summary", status_code=status.HTTP_200_OK, response_model=DashboardSummaryResponse)
def get_dashboard_metrics(
    vendor_id: Optional[int] = Query(default=None),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor["role"]
    if role == "vendor":
        effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    else:
        effective_vendor_id = vendor_id

    stats = get_dashboard_summary(db, vendor_id=effective_vendor_id)
    return success_response(message="Dashboard summary fetched", data=[stats])
