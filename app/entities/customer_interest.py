from sqlalchemy import Column, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class CustomerInterest(BaseModelMixin, Base):
    __tablename__ = "customer_interests"

    email = Column(String(255), nullable=False, index=True)
    phone_number = Column(String(30), nullable=True, index=True)
    country_code = Column(String(10), nullable=True)
