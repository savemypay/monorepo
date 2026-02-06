from sqlalchemy import Boolean, Column, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class VendorAccount(BaseModelMixin, Base):
    __tablename__ = "vendors"

    name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    phone_number = Column(String(30), nullable=True, unique=True, index=True)
    category = Column(String(100), nullable=True)
    comments = Column(String(1000), nullable=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
