from sqlalchemy import Column, ForeignKey, Integer, String, Text, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class RewardUserState(BaseModelMixin, Base):
    __tablename__ = "reward_user_states"
    __table_args__ = (
        UniqueConstraint("user_id", "state_key", name="uq_reward_user_state_key"),
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    state_key = Column(String(100), nullable=False, index=True)
    state_json = Column(Text, nullable=True)
