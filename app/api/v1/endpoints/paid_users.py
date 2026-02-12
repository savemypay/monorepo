import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor
from app.models.payment import PaidUsersResponse
from app.services.paid_users import list_paid_users
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
