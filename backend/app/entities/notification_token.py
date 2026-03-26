from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class NotificationToken(BaseModelMixin, Base):
    __tablename__ = "notification_tokens"
    __table_args__ = (
        UniqueConstraint("provider", "token_hash", name="uq_notification_token_provider_hash"),
    )

    installation_db_id = Column(Integer, ForeignKey("notification_installations.id"), nullable=False, index=True)
    channel = Column(String(20), nullable=False, server_default="push", index=True)
    provider = Column(String(50), nullable=False, server_default="firebase", index=True)
    token = Column(String(2048), nullable=False)
    token_hash = Column(String(64), nullable=False, index=True)
    is_active = Column(Boolean, nullable=False, server_default="true", index=True)
    last_registered_at = Column(DateTime(timezone=True), nullable=True)
    last_success_at = Column(DateTime(timezone=True), nullable=True)
    last_failure_at = Column(DateTime(timezone=True), nullable=True)
    invalidated_at = Column(DateTime(timezone=True), nullable=True)
    failure_reason = Column(String(255), nullable=True)
    delivery_count = Column(Integer, nullable=False, server_default="0")
    failure_count = Column(Integer, nullable=False, server_default="0")
