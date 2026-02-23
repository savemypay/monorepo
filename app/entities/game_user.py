from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.entities.base import BaseModelMixin


class GameUser(BaseModelMixin, Base):
    __tablename__ = "game_users"

    wallet_id = Column(String(255), unique=True, nullable=False, index=True)
    best_score = Column(Integer, nullable=True, index=True)
    best_score_achieved_at = Column(DateTime(timezone=True), nullable=True, index=True)
    is_active = Column(Boolean, nullable=False, server_default="true")

    scores = relationship("GameScore", back_populates="user", cascade="all, delete-orphan")

