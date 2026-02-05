from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from sqlalchemy import Integer

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Category(BaseModelMixin, Base):
    __tablename__ = "categories"

    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)

    vendors = relationship("Vendor", back_populates="category")
