from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text

from app.db.base import Base
from app.entities.base import BaseModelMixin


class NotificationDelivery(BaseModelMixin, Base):
    __tablename__ = "notification_deliveries"

    installation_db_id = Column(Integer, ForeignKey("notification_installations.id"), nullable=True, index=True)
    token_db_id = Column(Integer, ForeignKey("notification_tokens.id"), nullable=True, index=True)
    actor_type = Column(String(20), nullable=True, index=True)
    actor_id = Column(Integer, nullable=True, index=True)
    channel = Column(String(20), nullable=False, index=True)  # push, realtime
    provider = Column(String(50), nullable=False, index=True)
    category = Column(String(50), nullable=False, server_default="transactional", index=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    data_json = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default="queued", index=True)
    attempt_count = Column(Integer, nullable=False, server_default="0")
    provider_message_id = Column(String(255), nullable=True, index=True)
    error_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), nullable=True)
    clicked_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
