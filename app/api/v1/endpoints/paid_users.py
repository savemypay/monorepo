import logging
from datetime import date
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin, get_current_admin_or_vendor
from app.models.payment import DashboardSummaryResponse, PaginatedPaidUsersResponse, PaidUsersResponse
from app.services.paid_users import (
    get_dashboard_summary,
    list_customer_successful_transactions,
    list_paid_users,
)
from app.utils.response import success_response

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


@router.get("/paid-users", status_code=status.HTTP_200_OK, response_model=PaginatedPaidUsersResponse)
def get_paid_users(
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_admin_or_vendor)],
    ad_id: Annotated[Optional[int], Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    status_filter: Annotated[
        Optional[str],
        Query(alias="status", pattern="^(pending|requires_action|succeeded|failed|canceled)$"),
    ] = None,
    customer_id: Annotated[Optional[int], Query(ge=1)] = None,
    customer_search: Annotated[Optional[str], Query(max_length=255)] = None,
):
    role = actor["role"]
    vendor_id = int(actor.get("vendor_id") or actor.get("sub")) if role == "vendor" else None
    entries = list_paid_users(
        db,
        role=role,
        vendor_id=vendor_id,
        ad_id=ad_id,
        page=page,
        limit=limit,
        status_filter=status_filter,
        customer_id=customer_id,
        customer_search=customer_search,
    )
    return success_response(message="Paid users fetched", data=[entries])


@router.get("/dashboard-summary", status_code=status.HTTP_200_OK, response_model=DashboardSummaryResponse)
def get_dashboard_metrics(
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_admin_or_vendor)],
    vendor_id: Annotated[Optional[int], Query()] = None,
):
    role = actor["role"]
    if role == "vendor":
        effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    else:
        effective_vendor_id = vendor_id

    stats = get_dashboard_summary(db, vendor_id=effective_vendor_id)
    return success_response(message="Dashboard summary fetched", data=[stats])


@router.get("/customer-transactions", status_code=status.HTTP_200_OK, response_model=PaidUsersResponse)
def get_customer_successful_transactions(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[dict, Depends(get_current_admin)],
    customer_id: Annotated[int, Query(ge=1)],
    date_from: Annotated[date | None, Query()] = None,
    date_to: Annotated[date | None, Query()] = None,
):
    entries = list_customer_successful_transactions(
        db,
        customer_id=str(customer_id),
        date_from=date_from,
        date_to=date_to,
    )
    return success_response(message="Customer transactions fetched", data=entries)
