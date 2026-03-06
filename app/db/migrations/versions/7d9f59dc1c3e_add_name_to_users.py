"""add name to users

Revision ID: 7d9f59dc1c3e
Revises: 1f4f9c2f7a11
Create Date: 2026-03-06 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7d9f59dc1c3e"
down_revision: Union[str, Sequence[str], None] = "1f4f9c2f7a11"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("name", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "name")
