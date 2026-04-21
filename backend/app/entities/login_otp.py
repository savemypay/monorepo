from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, func

from app.db.base import Base


class LoginOtp(Base):
    __tablename__ = "login_otps"

    id = Column(Integer, primary_key=True, index=True)
    audience = Column(String(20), nullable=False, index=True)  # e.g., customer, vendor
    identifier = Column(String(255), nullable=False, index=True)  # email or phone
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, nullable=False, default=0)
    max_attempts = Column(Integer, nullable=False, default=5)
    consumed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        {"sqlite_autoincrement": True},
    )
