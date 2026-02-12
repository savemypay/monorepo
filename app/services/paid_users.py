from typing import List, Optional

from sqlalchemy import Integer, cast
from sqlalchemy.orm import Session, joinedload

from app.entities.ad import Ad
from app.entities.payment import Payment
from app.payments.base import PaymentStatus


def list_paid_users(db: Session, *, role: str, vendor_id: Optional[int], ad_id: Optional[int]) -> List[dict]:
    q = db.query(Payment).filter(Payment.status == PaymentStatus.SUCCEEDED)

    if ad_id is not None:
        q = q.filter(Payment.deal_ref == str(ad_id))

    if role == "vendor":
        # restrict to payments whose deal_ref matches ads owned by this vendor
        q = (
            q.join(Ad, cast(Payment.deal_ref, Integer) == Ad.id)
            .filter(Ad.vendor_id == vendor_id)
            .options(joinedload(Ad.tiers))
        )

    payments = q.order_by(Payment.created_at.desc()).all()

    return [
        {
            "payment_id": p.id,
            "deal_ref": p.deal_ref,
            "customer_ref": p.customer_ref,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
        }
        for p in payments
    ]
