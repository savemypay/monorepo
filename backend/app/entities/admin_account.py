from sqlalchemy import Boolean, Column, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class AdminAccount(BaseModelMixin, Base):
    __tablename__ = "admin_accounts"

    username = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=True, index=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
