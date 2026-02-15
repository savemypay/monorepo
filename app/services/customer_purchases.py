from typing import List

from sqlalchemy import cast, String
from sqlalchemy.orm import Session, joinedload

from app.entities.ad import Ad
from app.entities.payment import Payment
from app.payments.base import PaymentStatus


def list_customer_purchases(db: Session, customer_id: str) -> List[dict]:
    payments = (
        db.query(Payment)
        .filter(
            Payment.status == PaymentStatus.SUCCEEDED,
            Payment.customer_ref == customer_id,
        )
        .order_by(Payment.created_at.desc())
        .all()
    )

    ad_ids = [int(p.deal_ref) for p in payments if p.deal_ref and p.deal_ref.isdigit()]
    ads = (
        db.query(Ad)
        .filter(Ad.id.in_(ad_ids))
        .all()
        if ad_ids
        else []
    )
    ad_map = {a.id: a for a in ads}

    entries = []
    for p in payments:
        ad = ad_map.get(int(p.deal_ref)) if p.deal_ref and p.deal_ref.isdigit() else None
        entries.append(
            {
                "payment_id": p.id,
                "deal_ref": p.deal_ref,
                "amount": p.amount,
                "currency": p.currency,
                "status": p.status,
                "created_at": p.created_at,
                "ad": {
                    "id": ad.id,
                    "title": ad.title,
                    "product_name": ad.product_name,
                    "status": ad.status,
                    "valid_from": ad.valid_from,
                    "valid_to": ad.valid_to,
                    "images": ad.images,
                }
                if ad
                else None,
            }
        )
    return entries
