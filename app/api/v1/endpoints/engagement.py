import logging
from datetime import datetime
from typing import Annotated, Optional

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
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict | None, Depends(get_current_user_optional)] = None,
):
    item = capture_ad_interaction(db, ad_id=ad_id, payload=payload, actor=actor, request=request)
    return success_response(message="Interaction captured", data=[item])


@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard(
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_admin_or_vendor)],
    vendor_id: Annotated[Optional[int], Query()] = None,
    ad_id: Annotated[Optional[int], Query()] = None,
    event_type: Annotated[Optional[str], Query(pattern="^(view|click|cta_click)$")] = None,
    date_from: Annotated[Optional[datetime], Query()] = None,
    date_to: Annotated[Optional[datetime], Query()] = None,
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
