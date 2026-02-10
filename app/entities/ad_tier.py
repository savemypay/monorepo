from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.entities.base import BaseModelMixin


class AdTier(BaseModelMixin, Base):
    __tablename__ = "ad_tiers"

    ad_id = Column(Integer, ForeignKey("ads.id", ondelete="CASCADE"), nullable=False, index=True)
    seq = Column(Integer, nullable=False)  # ordering of tiers
    qty = Column(Integer, nullable=False)
    discount_pct = Column(Numeric(5, 2), nullable=False, default=0)
    token_amount = Column(Numeric(12, 2), nullable=True)
    label = Column(String(255), nullable=True)

    ad = relationship("Ad", back_populates="tiers")
