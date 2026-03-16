"""add role to users

Revision ID: 5c9b8b2e1c1f
Revises: 4b8f7a2c1d9e
Create Date: 2026-02-06 18:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5c9b8b2e1c1f"
down_revision: Union[str, Sequence[str], None] = "4b8f7a2c1d9e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(length=20), nullable=False, server_default="customer"))


def downgrade() -> None:
    op.drop_column("users", "role")
