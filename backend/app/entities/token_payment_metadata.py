from sqlalchemy import Column, Integer, JSON, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class TokenPaymentMetadata(BaseModelMixin, Base):
    __tablename__ = "token_payment_metadata"
    __table_args__ = (
        UniqueConstraint("ad_id", "customer_id", "vendor_id", name="uq_token_payment_metadata_scope"),
    )

    ad_id = Column(Integer, nullable=False, index=True)
    customer_id = Column(Integer, nullable=False, index=True)
    vendor_id = Column(Integer, nullable=False, index=True)
    metadata_json = Column(JSON, nullable=False)
