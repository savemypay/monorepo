"""ad interactions init

Revision ID: 3d4a63c6ef11
Revises: 7d9f59dc1c3e
Create Date: 2026-03-10 13:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3d4a63c6ef11"
down_revision: Union[str, Sequence[str], None] = "7d9f59dc1c3e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ad_interactions",
        sa.Column("ad_id", sa.Integer(), nullable=False),
        sa.Column("vendor_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("session_id", sa.String(length=128), nullable=True),
        sa.Column("event_type", sa.String(length=20), server_default="click", nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("ip_hash", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=512), nullable=True),
        sa.Column("referrer", sa.String(length=1000), nullable=True),
        sa.Column("actor_role", sa.String(length=20), nullable=True),
        sa.Column("ad_title", sa.String(length=255), nullable=True),
        sa.Column("ad_product_name", sa.String(length=255), nullable=True),
        sa.Column("meta", sa.JSON(), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["ad_id"], ["ads.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["vendor_id"], ["vendors.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_ad_interactions_ad_id"), "ad_interactions", ["ad_id"], unique=False)
    op.create_index(op.f("ix_ad_interactions_event_type"), "ad_interactions", ["event_type"], unique=False)
    op.create_index(op.f("ix_ad_interactions_id"), "ad_interactions", ["id"], unique=False)
    op.create_index(op.f("ix_ad_interactions_occurred_at"), "ad_interactions", ["occurred_at"], unique=False)
    op.create_index(op.f("ix_ad_interactions_session_id"), "ad_interactions", ["session_id"], unique=False)
    op.create_index(op.f("ix_ad_interactions_user_id"), "ad_interactions", ["user_id"], unique=False)
    op.create_index(op.f("ix_ad_interactions_vendor_id"), "ad_interactions", ["vendor_id"], unique=False)
    op.create_index(
        "ix_ad_interactions_vendor_occurred_at",
        "ad_interactions",
        ["vendor_id", "occurred_at"],
        unique=False,
    )
    op.create_index(
        "ix_ad_interactions_ad_occurred_at",
        "ad_interactions",
        ["ad_id", "occurred_at"],
        unique=False,
    )
    op.create_index(
        "ix_ad_interactions_vendor_ad_event",
        "ad_interactions",
        ["vendor_id", "ad_id", "event_type"],
        unique=False,
    )
    op.create_index(
        "ix_ad_interactions_user_ad_event",
        "ad_interactions",
        ["user_id", "ad_id", "event_type"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_ad_interactions_user_ad_event", table_name="ad_interactions")
    op.drop_index("ix_ad_interactions_vendor_ad_event", table_name="ad_interactions")
    op.drop_index("ix_ad_interactions_ad_occurred_at", table_name="ad_interactions")
    op.drop_index("ix_ad_interactions_vendor_occurred_at", table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_vendor_id"), table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_user_id"), table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_session_id"), table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_occurred_at"), table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_id"), table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_event_type"), table_name="ad_interactions")
    op.drop_index(op.f("ix_ad_interactions_ad_id"), table_name="ad_interactions")
    op.drop_table("ad_interactions")
