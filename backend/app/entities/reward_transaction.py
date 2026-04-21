from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class RewardTransaction(BaseModelMixin, Base):
    __tablename__ = "reward_transactions"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "event_type",
            "source_type",
            "source_id",
            name="uq_reward_txn_business_event",
        ),
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    source_type = Column(String(50), nullable=False, index=True)
    source_id = Column(String(255), nullable=False, index=True)
    points = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, server_default="credited", index=True)
    metadata_json = Column(Text, nullable=True)
