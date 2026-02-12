import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import (
    get_current_vendor_id,
    get_current_admin_or_vendor,
    get_current_user,
)
from app.models.ad import AdCreate, AdListResponse, AdResponse
from app.services.ad import create_ad, list_ads, get_ad, publish_ad
from app.utils.response import success_response

router = APIRouter(prefix="/ads", tags=["ads"])
logger = logging.getLogger(__name__)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=AdResponse)
def create_ad_endpoint(
    payload: AdCreate,
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor["role"]
    if role == "vendor":
        vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    else:  # admin
        if not payload.vendor_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Admin must provide vendor_id in payload",
            )
        vendor_id = payload.vendor_id
    ad = create_ad(db, vendor_id, payload)
    return success_response(message="Ad created", data=[ad])


@router.get("", status_code=status.HTTP_200_OK, response_model=AdListResponse)
def list_ads_endpoint(
    db: Session = Depends(get_db),
    vendor_id: Optional[int] = Query(default=None),
    actor: dict = Depends(get_current_user),
):
    role = actor["role"]
    effective_vendor_id = vendor_id
    active_only = False
    if role == "vendor":
        effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    elif role == "customer":
        active_only = True
        # customer can optionally filter by vendor_id; if none provided, see all active ads
    ads = list_ads(db, effective_vendor_id, active_only=active_only)
    return success_response(message="Ads fetched", data=ads)


@router.post("/{ad_id}/publish", status_code=status.HTTP_200_OK, response_model=AdResponse)
def publish_ad_endpoint(
    ad_id: int,
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor["role"]
    if role == "vendor":
        vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin publish not yet implemented",
        )
    ad = publish_ad(db, ad_id, vendor_id)
    return success_response(message="Ad published", data=[ad])
