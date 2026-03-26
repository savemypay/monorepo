from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class NotificationInstallation(BaseModelMixin, Base):
    __tablename__ = "notification_installations"

    installation_id = Column(String(128), nullable=False, unique=True, index=True)
    actor_type = Column(String(20), nullable=True, index=True)  # customer, vendor, admin
    actor_id = Column(Integer, nullable=True, index=True)
    platform = Column(String(20), nullable=False, index=True)  # android, ios, web
    app_version = Column(String(50), nullable=True)
    device_model = Column(String(255), nullable=True)
    locale = Column(String(32), nullable=True)
    timezone = Column(String(64), nullable=True)
    user_agent = Column(String(1000), nullable=True)
    notifications_enabled = Column(Boolean, nullable=False, server_default="true")
    is_anonymous = Column(Boolean, nullable=False, server_default="true")
    last_seen_at = Column(DateTime(timezone=True), nullable=True)
    last_authenticated_at = Column(DateTime(timezone=True), nullable=True)
