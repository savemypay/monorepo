from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.entities.ad import Ad
from app.entities.ad_favorite import AdFavorite
from app.entities.ad_tier import AdTier
from app.entities.vendor_account import VendorAccount
from app.models.ad import AdCreate
from app.repositories.ad import AdRepository
from app.utils.response import error_response


def _annotate_slots(ad: Ad):
    ad.slots_sold = ad.total_qty - ad.slots_remaining


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


def _validate_rejectable(ad: Ad):
    if ad.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_response(message="Ad is not in draft state", code="invalid_state"),
        )


def _validate_vendor_exists(db: Session, vendor_id: int) -> None:
    vendor_exists = (
        db.query(VendorAccount.id)
        .filter(VendorAccount.id == vendor_id)
        .first()
    )
    if not vendor_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Vendor not found", code="vendor_not_found"),
        )


def create_ad(db: Session, vendor_id: int, payload: AdCreate) -> Ad:
    _validate_vendor_exists(db, vendor_id)
    tiers_payload = [
        {
            "seq": t.seq,
            "qty": t.qty,
            "discount_pct": t.discount_pct,
            "label": t.label,
        }
        for t in payload.tiers
    ]
    ad = AdRepository.create_ad_with_tiers(
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
    _annotate_slots(ad)
    return ad


def list_ads(
    db: Session,
    vendor_id: int | None,
    active_only: bool = False,
    customer_user_id: int | None = None,
    status: str | None = None,
    page: int = 1,
    limit: int = 10,
) -> List[Ad]:
    q = db.query(Ad)
    if vendor_id is not None:
        q = q.filter(Ad.vendor_id == vendor_id)
    if status is not None:
        q = q.filter(Ad.status == status)
    if active_only:
        q = q.filter(Ad.status == "active")
    offset = (page - 1) * limit
    ads = q.order_by(Ad.created_at.desc()).offset(offset).limit(limit).all()

    favorite_ids: set[int] = set()
    if customer_user_id is not None and ads:
        ad_ids = [ad.id for ad in ads]
        rows = (
            db.query(AdFavorite.ad_id)
            .filter(
                AdFavorite.user_id == customer_user_id,
                AdFavorite.ad_id.in_(ad_ids),
            )
            .all()
        )
        favorite_ids = {row.ad_id for row in rows}

    for ad in ads:
        _annotate_slots(ad)
        ad.is_favorite = ad.id in favorite_ids
    return ads


def get_ad(db: Session, ad_id: int, vendor_id: int | None) -> Ad | None:
    if vendor_id is None:
        ad = db.query(Ad).filter(Ad.id == ad_id).first()
    else:
        ad = AdRepository.get_with_tiers(db, ad_id, vendor_id)
    if ad:
        _annotate_slots(ad)
    return ad


def publish_ad(db: Session, ad_id: int, vendor_id: int | None) -> Ad:
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
    _annotate_slots(ad)
    return ad


def reject_ad(db: Session, ad_id: int, vendor_id: int | None) -> Ad:
    ad = get_ad(db, ad_id, vendor_id)
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not found", code="ad_not_found"),
        )
    _validate_rejectable(ad)
    # The domain does not currently define a separate "rejected" status.
    ad.status = "canceled"
    db.add(ad)
    db.commit()
    db.refresh(ad)
    _annotate_slots(ad)
    return ad


def set_ad_favorite(db: Session, *, ad_id: int, user_id: int, is_favorite: bool) -> dict:
    ad = db.query(Ad).filter(Ad.id == ad_id).first()
    if not ad:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=error_response(message="Ad not found", code="ad_not_found"),
        )

    favorite = (
        db.query(AdFavorite)
        .filter(AdFavorite.ad_id == ad_id, AdFavorite.user_id == user_id)
        .first()
    )

    changed = False
    if is_favorite:
        if not favorite:
            favorite = AdFavorite(
                ad_id=ad_id,
                user_id=user_id,
                created_by="customer",
            )
            db.add(favorite)
            db.commit()
            changed = True
    else:
        if favorite:
            db.delete(favorite)
            db.commit()
            changed = True

    return {
        "ad_id": ad_id,
        "is_favorite": is_favorite,
        "changed": changed,
    }
