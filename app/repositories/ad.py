from typing import List

from sqlalchemy.orm import Session, joinedload

from app.entities.ad import Ad
from app.entities.ad_tier import AdTier


class AdRepository:
    @staticmethod
    def create_ad_with_tiers(
        db: Session,
        *,
        vendor_id: int,
        title: str,
        product_name: str | None,
        original_price: float,
        total_qty: int,
        images: list[str] | None,
        description: str | None,
        terms: str | None,
        valid_from,
        valid_to,
        tiers: list[dict],
    ) -> Ad:
        ad = Ad(
            vendor_id=vendor_id,
            title=title,
            product_name=product_name,
            original_price=original_price,
            total_qty=total_qty,
            slots_remaining=total_qty,
            images=images,
            description=description,
            terms=terms,
            valid_from=valid_from,
            valid_to=valid_to,
            status="draft",
        )
        db.add(ad)
        db.flush()

        tier_rows: List[AdTier] = []
        for t in tiers:
            tier_rows.append(
                AdTier(
                    ad_id=ad.id,
                    seq=t["seq"],
                    qty=t["qty"],
                    discount_pct=t["discount_pct"],
                    token_amount=t.get("token_amount"),
                    label=t.get("label"),
                )
            )
        db.add_all(tier_rows)
        db.commit()
        db.refresh(ad)
        return ad

    @staticmethod
    def list_by_vendor(db: Session, vendor_id: int) -> list[Ad]:
        return (
            db.query(Ad)
            .filter(Ad.vendor_id == vendor_id)
            .options(joinedload(Ad.tiers))
            .order_by(Ad.created_at.desc())
            .all()
        )

    @staticmethod
    def get_with_tiers(db: Session, ad_id: int, vendor_id: int) -> Ad | None:
        return (
            db.query(Ad)
            .options(joinedload(Ad.tiers))
            .filter(Ad.id == ad_id, Ad.vendor_id == vendor_id)
            .first()
        )
