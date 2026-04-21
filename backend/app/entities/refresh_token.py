from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.db.base import Base
from app.entities.base import BaseModelMixin


class RefreshToken(BaseModelMixin, Base):
    __tablename__ = "refresh_tokens"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True)
    user_agent = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
