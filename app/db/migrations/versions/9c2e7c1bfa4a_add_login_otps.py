"""add login otps table

Revision ID: 9c2e7c1bfa4a
Revises: 72f6a7a07c3a
Create Date: 2026-02-06 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9c2e7c1bfa4a"
down_revision: Union[str, Sequence[str], None] = "72f6a7a07c3a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "login_otps",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("audience", sa.String(length=20), nullable=False),
        sa.Column("identifier", sa.String(length=255), nullable=False),
        sa.Column("code_hash", sa.String(length=255), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("max_attempts", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_login_otps_audience_identifier", "login_otps", ["audience", "identifier"])
    op.create_index("ix_login_otps_expires_at", "login_otps", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_login_otps_expires_at", table_name="login_otps")
    op.drop_index("ix_login_otps_audience_identifier", table_name="login_otps")
    op.drop_table("login_otps")
