"""game entities

Revision ID: 9f2a6d4d7b11
Revises: 73027eb4b1d1
Create Date: 2026-02-23 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9f2a6d4d7b11"
down_revision: Union[str, Sequence[str], None] = "73027eb4b1d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "game_users",
        sa.Column("wallet_id", sa.String(length=255), nullable=False),
        sa.Column("best_score", sa.Integer(), nullable=True),
        sa.Column("best_score_achieved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_game_users_best_score"), "game_users", ["best_score"], unique=False)
    op.create_index(
        op.f("ix_game_users_best_score_achieved_at"),
        "game_users",
        ["best_score_achieved_at"],
        unique=False,
    )
    op.create_index(op.f("ix_game_users_id"), "game_users", ["id"], unique=False)
    op.create_index(op.f("ix_game_users_wallet_id"), "game_users", ["wallet_id"], unique=True)

    op.create_table(
        "game_scores",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("achieved_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["game_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_game_scores_achieved_at"), "game_scores", ["achieved_at"], unique=False)
    op.create_index(op.f("ix_game_scores_id"), "game_scores", ["id"], unique=False)
    op.create_index(op.f("ix_game_scores_score"), "game_scores", ["score"], unique=False)
    op.create_index(op.f("ix_game_scores_user_id"), "game_scores", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_game_scores_user_id"), table_name="game_scores")
    op.drop_index(op.f("ix_game_scores_score"), table_name="game_scores")
    op.drop_index(op.f("ix_game_scores_id"), table_name="game_scores")
    op.drop_index(op.f("ix_game_scores_achieved_at"), table_name="game_scores")
    op.drop_table("game_scores")

    op.drop_index(op.f("ix_game_users_wallet_id"), table_name="game_users")
    op.drop_index(op.f("ix_game_users_id"), table_name="game_users")
    op.drop_index(op.f("ix_game_users_best_score_achieved_at"), table_name="game_users")
    op.drop_index(op.f("ix_game_users_best_score"), table_name="game_users")
    op.drop_table("game_users")

