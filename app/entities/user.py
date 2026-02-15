from sqlalchemy import Boolean, Column, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class User(BaseModelMixin, Base):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    country_code = Column(String(10), nullable=True)
    phone_number = Column(String(30), nullable=True, index=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
    role = Column(String(20), nullable=False, server_default="customer")  # customer or vendor
