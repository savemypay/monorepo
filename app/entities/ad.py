from sqlalchemy import Boolean, Column, DateTime, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Ad(BaseModelMixin, Base):
    __tablename__ = "ads"

    vendor_id = Column(Integer, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    product_name = Column(String(255), nullable=True)
    original_price = Column(Numeric(12, 2), nullable=False)
    token_amount = Column(Numeric(12, 2), nullable=False)
    total_qty = Column(Integer, nullable=False)
    slots_remaining = Column(Integer, nullable=False)
    status = Column(String(20), nullable=False, default="draft", index=True)  # draft, active, filled, expired, canceled
    category = Column(String(100), nullable=False, default="")
    description = Column(Text, nullable=True)
    terms = Column(Text, nullable=True)
    images = Column(JSONB, nullable=True)  # list of URLs
    valid_from = Column(DateTime(timezone=True), nullable=True)
    valid_to = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, nullable=False, server_default="true")

    tiers = relationship(
        "AdTier",
        back_populates="ad",
        cascade="all, delete-orphan",
        order_by="AdTier.seq",
    )
