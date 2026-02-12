from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.entities.ad import Ad
from app.entities.ad_tier import AdTier
from app.models.ad import AdCreate
from app.repositories.ad import AdRepository
from app.utils.response import error_response


def _validate_publishable(ad: Ad):
    if ad.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Ad is not in draft state", code="invalid_state"),
        )
    if not ad.tiers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Ad tiers missing", code="tiers_missing"),
        )


def create_ad(db: Session, vendor_id: int, payload: AdCreate) -> Ad:
    tiers_payload = [
        {
            "seq": t.seq,
            "qty": t.qty,
            "discount_pct": t.discount_pct,
            "label": t.label,
        }
        for t in payload.tiers
    ]
    return AdRepository.create_ad_with_tiers(
        db,
        vendor_id=vendor_id,
        title=payload.title,
        product_name=payload.product_name,
        original_price=payload.original_price,
        token_amount=payload.token_amount,
        total_qty=payload.total_qty,
        images=payload.images,
        description=payload.description,
        terms=payload.terms,
        valid_from=payload.valid_from,
        valid_to=payload.valid_to,
        tiers=tiers_payload,
        category=payload.category,
    )


def list_ads(db: Session, vendor_id: int | None, active_only: bool = False) -> List[Ad]:
    q = db.query(Ad)
    if vendor_id is not None:
        q = q.filter(Ad.vendor_id == vendor_id)
    if active_only:
        q = q.filter(Ad.status == "active")
    return q.order_by(Ad.created_at.desc()).all()


def get_ad(db: Session, ad_id: int, vendor_id: int) -> Ad | None:
    return AdRepository.get_with_tiers(db, ad_id, vendor_id)


def publish_ad(db: Session, ad_id: int, vendor_id: int) -> Ad:
    ad = get_ad(db, ad_id, vendor_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not found", code="ad_not_found"),
        )
    _validate_publishable(ad)
    ad.status = "active"
    db.add(ad)
    db.commit()
    db.refresh(ad)
    return ad
