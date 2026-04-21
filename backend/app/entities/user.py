from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class User(BaseModelMixin, Base):
    __tablename__ = "users"

    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    country_code = Column(String(10), nullable=True)
    phone_number = Column(String(30), nullable=True, index=True)
    is_active = Column(Boolean, nullable=False, server_default="true")
    role = Column(String(20), nullable=False, server_default="customer")  # customer or vendor
    referral_points = Column(Integer, nullable=False, server_default="0")
    referral_code = Column(String(20), unique=True, nullable=True, index=True)
    referred_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    referred_at = Column(DateTime(timezone=True), nullable=True)
