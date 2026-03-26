"""add category and token_amount on ads, drop token_amount from ad_tiers

Revision ID: a1d3f4c2e7b8
Revises: 91b3c6f0e2c7
Create Date: 2026-02-06 19:05:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a1d3f4c2e7b8"
down_revision: Union[str, Sequence[str], None] = "91b3c6f0e2c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("ads", sa.Column("token_amount", sa.Numeric(12, 2), nullable=False, server_default="0"))
    op.add_column("ads", sa.Column("category", sa.String(length=100), nullable=False, server_default=""))
    op.alter_column("ads", "token_amount", server_default=None)
    op.alter_column("ads", "category", server_default=None)
    # drop token_amount from ad_tiers
    with op.batch_alter_table("ad_tiers") as batch_op:
        batch_op.drop_column("token_amount")


def downgrade() -> None:
    with op.batch_alter_table("ad_tiers") as batch_op:
        batch_op.add_column(sa.Column("token_amount", sa.Numeric(12, 2), nullable=True))
    op.drop_column("ads", "category")
    op.drop_column("ads", "token_amount")
