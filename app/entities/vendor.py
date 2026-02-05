from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Vendor(BaseModelMixin, Base):
    __tablename__ = "vendors"

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone_number = Column(String(30), nullable=False, index=True)
    country_code = Column(String(10), nullable=True)
    address = Column(String(500), nullable=True)
    comments = Column(String(1000), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    category = relationship("Category", back_populates="vendors")
