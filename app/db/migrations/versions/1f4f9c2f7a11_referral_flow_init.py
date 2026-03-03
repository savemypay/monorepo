"""referral flow init

Revision ID: 1f4f9c2f7a11
Revises: 28bd27a6ce8a
Create Date: 2026-03-03 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1f4f9c2f7a11"
down_revision: Union[str, Sequence[str], None] = "28bd27a6ce8a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("referral_code", sa.String(length=20), nullable=True))
    op.add_column("users", sa.Column("referred_by_user_id", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("referred_at", sa.DateTime(timezone=True), nullable=True))
    op.create_foreign_key(
        "fk_users_referred_by_user_id_users",
        "users",
        "users",
        ["referred_by_user_id"],
        ["id"],
    )
    op.create_index(op.f("ix_users_referral_code"), "users", ["referral_code"], unique=True)
    op.create_index(op.f("ix_users_referred_by_user_id"), "users", ["referred_by_user_id"], unique=False)

    op.create_table(
        "referral_rewards",
        sa.Column("referrer_user_id", sa.Integer(), nullable=False),
        sa.Column("referred_user_id", sa.Integer(), nullable=False),
        sa.Column("payment_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("reward_amount", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["payment_id"], ["payments.id"]),
        sa.ForeignKeyConstraint(["referred_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["referrer_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("referred_user_id", "event_type", name="uq_referral_reward_referred_event"),
    )
    op.create_index(op.f("ix_referral_rewards_event_type"), "referral_rewards", ["event_type"], unique=False)
    op.create_index(op.f("ix_referral_rewards_id"), "referral_rewards", ["id"], unique=False)
    op.create_index(op.f("ix_referral_rewards_payment_id"), "referral_rewards", ["payment_id"], unique=False)
    op.create_index(op.f("ix_referral_rewards_referred_user_id"), "referral_rewards", ["referred_user_id"], unique=False)
    op.create_index(op.f("ix_referral_rewards_referrer_user_id"), "referral_rewards", ["referrer_user_id"], unique=False)
    op.create_index(op.f("ix_referral_rewards_status"), "referral_rewards", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_referral_rewards_status"), table_name="referral_rewards")
    op.drop_index(op.f("ix_referral_rewards_referrer_user_id"), table_name="referral_rewards")
    op.drop_index(op.f("ix_referral_rewards_referred_user_id"), table_name="referral_rewards")
    op.drop_index(op.f("ix_referral_rewards_payment_id"), table_name="referral_rewards")
    op.drop_index(op.f("ix_referral_rewards_id"), table_name="referral_rewards")
    op.drop_index(op.f("ix_referral_rewards_event_type"), table_name="referral_rewards")
    op.drop_table("referral_rewards")

    op.drop_index(op.f("ix_users_referred_by_user_id"), table_name="users")
    op.drop_index(op.f("ix_users_referral_code"), table_name="users")
    op.drop_constraint("fk_users_referred_by_user_id_users", "users", type_="foreignkey")
    op.drop_column("users", "referred_at")
    op.drop_column("users", "referred_by_user_id")
    op.drop_column("users", "referral_code")

