from sqlalchemy import Column, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Vendor(BaseModelMixin, Base):
    __tablename__ = "vendors"

    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    phone_number = Column(String(30), nullable=False, index=True)
    comments = Column(String(1000), nullable=True)
    category = Column(String(100), nullable=False)
