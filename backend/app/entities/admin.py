from sqlalchemy import Boolean, Column, ForeignKey, Integer

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Admin(BaseModelMixin, Base):
    __tablename__ = "admins"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default="true")
