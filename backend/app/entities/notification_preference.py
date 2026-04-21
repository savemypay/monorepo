from sqlalchemy import Boolean, Column, ForeignKey, Integer, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class NotificationPreference(BaseModelMixin, Base):
    __tablename__ = "notification_preferences"

    installation_db_id = Column(Integer, ForeignKey("notification_installations.id"), nullable=False, unique=True, index=True)
    push_enabled = Column(Boolean, nullable=False, server_default="true")
    realtime_enabled = Column(Boolean, nullable=False, server_default="true")
    transactional_enabled = Column(Boolean, nullable=False, server_default="true")
    marketing_enabled = Column(Boolean, nullable=False, server_default="false")
    system_enabled = Column(Boolean, nullable=False, server_default="true")
    quiet_hours_start = Column(String(5), nullable=True)  # HH:MM in installation timezone
    quiet_hours_end = Column(String(5), nullable=True)  # HH:MM in installation timezone
