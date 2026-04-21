from sqlalchemy import Column, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.entities.base import BaseModelMixin


class GameScore(BaseModelMixin, Base):
    __tablename__ = "game_scores"

    user_id = Column(Integer, ForeignKey("game_users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False, index=True)
    achieved_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)

    user = relationship("GameUser", back_populates="scores")

