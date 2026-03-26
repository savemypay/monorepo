"""create ads and ad_tiers tables

Revision ID: 4b8f7a2c1d9e
Revises: 7f4c2a7d9e5a
Create Date: 2026-02-06 17:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4b8f7a2c1d9e"
down_revision: Union[str, Sequence[str], None] = "7f4c2a7d9e5a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ads",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), onupdate=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("vendor_id", sa.Integer(), nullable=False, index=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("product_name", sa.String(length=255), nullable=True),
        sa.Column("original_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("total_qty", sa.Integer(), nullable=False),
        sa.Column("slots_remaining", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft", index=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("terms", sa.Text(), nullable=True),
        sa.Column("images", sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_to", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
    )

    op.create_table(
        "ad_tiers",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), onupdate=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("ad_id", sa.Integer(), sa.ForeignKey("ads.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("seq", sa.Integer(), nullable=False),
        sa.Column("qty", sa.Integer(), nullable=False),
        sa.Column("discount_pct", sa.Numeric(5, 2), nullable=False, server_default="0"),
        sa.Column("token_amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("label", sa.String(length=255), nullable=True),
    )
    op.create_index("ix_ad_tiers_ad_id_seq", "ad_tiers", ["ad_id", "seq"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_ad_tiers_ad_id_seq", table_name="ad_tiers")
    op.drop_table("ad_tiers")
    op.drop_table("ads")
