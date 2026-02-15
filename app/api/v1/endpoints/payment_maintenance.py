import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor
from app.services.payment import expire_stale_payments
from app.utils.response import success_response

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)


@router.post("/expire-pending", status_code=status.HTTP_200_OK)
def expire_pending(
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    # allow admin or vendor to trigger; vendors only affect their ads via deal_ref matching in service
    role = actor["role"]
    vendor_id = None
    if role == "vendor":
        vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    count = expire_stale_payments(db, vendor_id=vendor_id)
    return success_response(message="Expired pending payments", data=[{"released": count}])
