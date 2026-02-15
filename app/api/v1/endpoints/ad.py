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
from app.models.ad import AdCreate, AdListResponse, AdResponse, ImageAttachRequest
from app.services.ad import create_ad, list_ads, get_ad, publish_ad
from app.services.s3 import generate_presigned_upload
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
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can publish ads",
        )
    ad = publish_ad(db, ad_id, vendor_id=None)
    return success_response(message="Ad published", data=[ad])


@router.post("/{ad_id}/images/presign", status_code=status.HTTP_200_OK)
def presign_ad_image(
    ad_id: int,
    filename: str = Query(..., description="Original filename"),
    content_type: str = Query(..., description="MIME type"),
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor["role"]
    vendor_id = int(actor.get("vendor_id") or actor.get("sub")) if role == "vendor" else None
    ad = get_ad(db, ad_id, vendor_id) if role == "vendor" else get_ad(db, ad_id, vendor_id=None)
    if not ad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad not found or not accessible")

    presign = generate_presigned_upload(filename, content_type)
    return success_response(message="Presigned URL created", data=[presign])


@router.post("/{ad_id}/images/attach", status_code=status.HTTP_200_OK)
def attach_ad_image(
    ad_id: int,
    payload: ImageAttachRequest,
    db: Session = Depends(get_db),
    actor: dict = Depends(get_current_admin_or_vendor),
):
    role = actor["role"]
    vendor_id = int(actor.get("vendor_id") or actor.get("sub")) if role == "vendor" else None
    ad = get_ad(db, ad_id, vendor_id) if role == "vendor" else get_ad(db, ad_id, vendor_id=None)
    if not ad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ad not found or not accessible")

    public_url = payload.public_url
    if not public_url:
        if not payload.key:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="key is required")
        from app.core.config import S3_PUBLIC_BASE_URL

        if not S3_PUBLIC_BASE_URL:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="S3_PUBLIC_BASE_URL not configured")
        public_url = f"{S3_PUBLIC_BASE_URL.rstrip('/')}/{payload.key}"

    images = ad.images or []
    images.append(public_url)
    ad.images = images
    db.add(ad)
    db.commit()
    db.refresh(ad)

    return success_response(message="Image attached", data=[{"url": public_url}])
