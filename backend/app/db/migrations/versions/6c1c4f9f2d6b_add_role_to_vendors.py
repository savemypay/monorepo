"""add role to vendors

Revision ID: 6c1c4f9f2d6b
Revises: 5c9b8b2e1c1f
Create Date: 2026-02-06 18:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6c1c4f9f2d6b"
down_revision: Union[str, Sequence[str], None] = "5c9b8b2e1c1f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("vendors", sa.Column("role", sa.String(length=20), nullable=False, server_default="vendor"))


def downgrade() -> None:
    op.drop_column("vendors", "role")
