from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, JSON, String, func

from app.db.base import Base
from app.entities.base import BaseModelMixin


class AdInteraction(BaseModelMixin, Base):
    __tablename__ = "ad_interactions"
    __table_args__ = (
        Index("ix_ad_interactions_vendor_occurred_at", "vendor_id", "occurred_at"),
        Index("ix_ad_interactions_ad_occurred_at", "ad_id", "occurred_at"),
        Index("ix_ad_interactions_vendor_ad_event", "vendor_id", "ad_id", "event_type"),
        Index("ix_ad_interactions_user_ad_event", "user_id", "ad_id", "event_type"),
    )

    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(128), nullable=True, index=True)
    event_type = Column(String(20), nullable=False, server_default="click", index=True)
    occurred_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), index=True)
    ip_hash = Column(String(64), nullable=True)
    user_agent = Column(String(512), nullable=True)
    referrer = Column(String(1000), nullable=True)
    actor_role = Column(String(20), nullable=True)
    ad_title = Column(String(255), nullable=True)
    ad_product_name = Column(String(255), nullable=True)
    meta = Column(JSON, nullable=True)
