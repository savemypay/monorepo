from sqlalchemy import Column, String

from app.db.base import Base
from app.entities.base import BaseModelMixin


class Role(BaseModelMixin, Base):
    __tablename__ = "roles"

    name = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(String(255), nullable=True)
