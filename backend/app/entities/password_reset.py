from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.db.base import Base
from app.entities.base import BaseModelMixin


class PasswordReset(BaseModelMixin, Base):
    __tablename__ = "password_resets"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
