from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class AdFavorite(BaseModelMixin, Base):
    __tablename__ = "ad_favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "ad_id", name="uq_ad_favorites_user_ad"),
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ad_id = Column(Integer, ForeignKey("ads.id"), nullable=False, index=True)
