from typing import List, Optional

from sqlalchemy import Integer, cast
from sqlalchemy.orm import Session

from app.entities.ad import Ad
from app.entities.payment import Payment
from app.entities.user import User
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
        )

    payments = q.order_by(Payment.created_at.desc()).all()

    # Fetch user details for customer_refs that look like ints
    user_ids = {int(p.customer_ref) for p in payments if p.customer_ref and p.customer_ref.isdigit()}
    users = (
        db.query(User)
        .filter(User.id.in_(user_ids))
        .all()
        if user_ids
        else []
    )
    user_map = {u.id: u for u in users}

    return [
        {
            "payment_id": p.id,
            "deal_ref": p.deal_ref,
            "customer_ref": p.customer_ref,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
            "user_email": user_map.get(int(p.customer_ref)).email if p.customer_ref and p.customer_ref.isdigit() and int(p.customer_ref) in user_map else None,
            "user_phone_number": user_map.get(int(p.customer_ref)).phone_number if p.customer_ref and p.customer_ref.isdigit() and int(p.customer_ref) in user_map else None,
            "user_name": getattr(user_map.get(int(p.customer_ref)), "name", None) if p.customer_ref and p.customer_ref.isdigit() and int(p.customer_ref) in user_map else None,
        }
        for p in payments
    ]
