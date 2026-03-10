import logging
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import get_current_admin_or_vendor, get_current_user_optional
from app.models.engagement import AdInteractionCaptureRequest
from app.services.engagement import capture_ad_interaction, get_engagement_dashboard
from app.utils.response import success_response

router = APIRouter(prefix="/engagement", tags=["engagement"])
logger = logging.getLogger(__name__)


@router.post("/ads/{ad_id}/interactions", status_code=status.HTTP_201_CREATED)
def track_ad_interaction(
    ad_id: int,
    payload: AdInteractionCaptureRequest,
    request: Request,
    db: Session = Depends(get_db),
    actor: dict | None = Depends(get_current_user_optional),
):
    item = capture_ad_interaction(db, ad_id=ad_id, payload=payload, actor=actor, request=request)
    return success_response(message="Interaction captured", data=[item])


@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard(
    vendor_id: Optional[int] = Query(default=None),
    ad_id: Optional[int] = Query(default=None),
    event_type: Optional[str] = Query(default=None, pattern="^(view|click|cta_click)$"),
    date_from: Optional[datetime] = Query(default=None),
    date_to: Optional[datetime] = Query(default=None),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    stats = get_engagement_dashboard(
        db,
        actor=actor,
        vendor_id=vendor_id,
        ad_id=ad_id,
        event_type=event_type,
        date_from=date_from,
        date_to=date_to,
    )
    return success_response(message="Engagement dashboard fetched", data=[stats])
