from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class RewardAccount(BaseModelMixin, Base):
    __tablename__ = "reward_accounts"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_reward_account_user"),
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    current_balance = Column(Integer, nullable=False, server_default="0")
    lifetime_earned = Column(Integer, nullable=False, server_default="0")
    lifetime_redeemed = Column(Integer, nullable=False, server_default="0")
