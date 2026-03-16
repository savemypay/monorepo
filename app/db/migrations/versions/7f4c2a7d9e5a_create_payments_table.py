"""create payments table

Revision ID: 7f4c2a7d9e5a
Revises: 2d7c3e6b2d8c
Create Date: 2026-02-06 17:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7f4c2a7d9e5a"
down_revision: Union[str, Sequence[str], None] = "2d7c3e6b2d8c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), onupdate=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("provider_payment_id", sa.String(length=255), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("idempotency_key", sa.String(length=255), nullable=False),
        sa.Column("customer_ref", sa.String(length=255), nullable=True),
        sa.Column("deal_ref", sa.String(length=255), nullable=True),
        sa.Column("client_secret", sa.String(length=255), nullable=True),
        sa.Column("error_code", sa.String(length=100), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("raw_response", sa.Text(), nullable=True),
        sa.Column("raw_webhook", sa.Text(), nullable=True),
    )
    op.create_index("ix_payments_provider_payment_id", "payments", ["provider_payment_id"])
    op.create_index("ix_payments_status", "payments", ["status"])
    op.create_index("ix_payments_provider", "payments", ["provider"])
    op.create_unique_constraint("uq_payment_provider_idempotency", "payments", ["provider", "idempotency_key"])


def downgrade() -> None:
    op.drop_constraint("uq_payment_provider_idempotency", "payments", type_="unique")
    op.drop_index("ix_payments_provider", table_name="payments")
    op.drop_index("ix_payments_status", table_name="payments")
    op.drop_index("ix_payments_provider_payment_id", table_name="payments")
    op.drop_table("payments")
