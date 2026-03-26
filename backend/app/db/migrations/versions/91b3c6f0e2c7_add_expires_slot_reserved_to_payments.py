"""add expires_at and slot_reserved to payments

Revision ID: 91b3c6f0e2c7
Revises: 8d2c5b1e4d1a
Create Date: 2026-02-06 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "91b3c6f0e2c7"
down_revision: Union[str, Sequence[str], None] = "8d2c5b1e4d1a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("payments", sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("payments", sa.Column("slot_reserved", sa.Boolean(), nullable=False, server_default="false"))


def downgrade() -> None:
    op.drop_column("payments", "slot_reserved")
    op.drop_column("payments", "expires_at")
