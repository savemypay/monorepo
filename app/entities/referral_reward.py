from sqlalchemy import Column, ForeignKey, Integer, String, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class ReferralReward(BaseModelMixin, Base):
    __tablename__ = "referral_rewards"
    __table_args__ = (
        UniqueConstraint("referred_user_id", "event_type", name="uq_referral_reward_referred_event"),
    )

    referrer_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    referred_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False, default="first_successful_payment", index=True)
    reward_amount = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="pending", index=True)  # placeholder only

