import logging
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.api.security import (
    get_current_admin_or_vendor,
    get_current_customer,
    get_current_user_optional,
    get_current_admin
)
from app.models.ad import AdCreate, AdListResponse, AdResponse, ImageAttachRequest, FavoriteUpdateRequest
from app.services.ad import create_ad, list_ads, get_ad, publish_ad, reject_ad, set_ad_favorite
from app.services.s3 import generate_presigned_upload
from app.utils.response import error_response, success_response

router = APIRouter(prefix="/ads", tags=["ads"])
logger = logging.getLogger(__name__)


def _require_admin(actor: dict) -> None:
    if actor.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=error_response(message="Only admin can perform this action", code="forbidden"),
        )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=AdResponse)
def create_ad_endpoint(
    payload: AdCreate,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_admin_or_vendor)],
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
    db: Annotated[Session, Depends(get_db)],
    vendor_id: Annotated[Optional[int], Query()] = None,
    page: Annotated[int, Query(ge=1)] = 1,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    status_filter: Annotated[Optional[str], Query(
        alias="status",
        pattern="^(draft|active|filled|expired|canceled)$",
    )] = None,
    actor: Annotated[Optional[dict], Depends(get_current_user_optional)] = None,
):
    effective_vendor_id = vendor_id
    active_only = False
    customer_user_id: int | None = None
    effective_status = status_filter

    if actor is None:
        # Public callers can only see active ads.
        active_only = True
        if status_filter is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_response(
                    message="status filter is allowed only for admin/vendor",
                    code="validation_error",
                ),
            )
        effective_status = None
    else:
        role = actor.get("role")
        if role == "vendor":
            effective_vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
        elif role == "customer":
            active_only = True
            customer_user_id = int(actor.get("user_id") or actor.get("sub"))
            if status_filter is not None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_response(
                        message="status filter is allowed only for admin/vendor",
                        code="validation_error",
                    ),
                )
            effective_status = None
            # customer can optionally filter by vendor_id; if none provided, see all active ads

    ads = list_ads(
        db,
        effective_vendor_id,
        active_only=active_only,
        customer_user_id=customer_user_id,
        status=effective_status,
        page=page,
        limit=limit,
    )
    return success_response(message="Ads fetched", data=ads)


@router.get("/{ad_id}", status_code=status.HTTP_200_OK, response_model=AdResponse)
def get_ad_by_id_endpoint(
    ad_id: int,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[Optional[dict], Depends(get_current_user_optional)] = None,
):
    if actor is None:
        ad = get_ad(db, ad_id, vendor_id=None)
        if not ad or ad.status != "active":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_response(message="Ad not found", code="ad_not_found"),
            )
        return success_response(message="Ad fetched", data=[ad])

    role = actor.get("role")
    if role == "vendor":
        vendor_id = int(actor.get("vendor_id") or actor.get("sub"))
        ad = get_ad(db, ad_id, vendor_id=vendor_id)
    else:
        ad = get_ad(db, ad_id, vendor_id=None)
        if role != "admin" and ad and ad.status != "active":
            ad = None

    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not found", code="ad_not_found"),
        )

    return success_response(message="Ad fetched", data=[ad])


@router.post("/{ad_id}/publish", status_code=status.HTTP_200_OK, response_model=AdResponse)
def publish_ad_endpoint(
    ad_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[dict, Depends(get_current_admin)],
):
    ad = publish_ad(db, ad_id, vendor_id=None)
    return success_response(message="Ad published", data=[ad])


@router.post("/{ad_id}/reject", status_code=status.HTTP_200_OK, response_model=AdResponse)
def reject_ad_endpoint(
    ad_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[dict, Depends(get_current_admin)],
):
    ad = reject_ad(db, ad_id, vendor_id=None)
    return success_response(message="Ad rejected", data=[ad])


@router.post("/{ad_id}/images/presign", status_code=status.HTTP_200_OK)
def presign_ad_image(
    ad_id: int,
    filename: Annotated[str, Query(description="Original filename")],
    content_type: Annotated[str, Query(description="MIME type")],
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_admin_or_vendor)],
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
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_admin_or_vendor)],
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


@router.put("/{ad_id}/favorite", status_code=status.HTTP_200_OK)
def favorite_ad(
    ad_id: int,
    payload: FavoriteUpdateRequest,
    db: Annotated[Session, Depends(get_db)],
    actor: Annotated[dict, Depends(get_current_customer)],
):
    user_id = int(actor.get("user_id") or actor.get("sub"))
    result = set_ad_favorite(db, ad_id=ad_id, user_id=user_id, is_favorite=payload.is_favorite)
    message = "Ad marked as favorite" if payload.is_favorite else "Ad removed from favorites"
    return success_response(message=message, data=[result])
