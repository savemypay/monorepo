from sqlalchemy import Column, ForeignKey, Integer, UniqueConstraint

from app.db.base import Base
from app.entities.base import BaseModelMixin


class UserRole(BaseModelMixin, Base):
    __tablename__ = "user_roles"
    __table_args__ = (
        UniqueConstraint("user_id", "role_id", name="uq_user_role"),
    )

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
