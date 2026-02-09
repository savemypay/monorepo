from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text, UniqueConstraint, func

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Payment(BaseModelMixin, Base):
    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("provider", "idempotency_key", name="uq_payment_provider_idempotency"),
    )

    provider = Column(String(50), nullable=False, index=True)
    provider_payment_id = Column(String(255), nullable=True, index=True)
    status = Column(String(50), nullable=False, index=True)  # pending, requires_action, succeeded, failed, canceled
    amount = Column(Integer, nullable=False)  # minor units (e.g., cents)
    currency = Column(String(10), nullable=False)
    idempotency_key = Column(String(255), nullable=False)
    customer_ref = Column(String(255), nullable=True)
    deal_ref = Column(String(255), nullable=True)  # loose reference to a deal/signup
    client_secret = Column(String(255), nullable=True)
    error_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    raw_response = Column(Text, nullable=True)
    raw_webhook = Column(Text, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
