"""add notification foundation

Revision ID: 7b6d4e2f9c11
Revises: d0cdf3db049b
Create Date: 2026-03-18 12:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7b6d4e2f9c11"
down_revision: Union[str, Sequence[str], None] = "d0cdf3db049b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "notification_installations",
        sa.Column("installation_id", sa.String(length=128), nullable=False),
        sa.Column("actor_type", sa.String(length=20), nullable=True),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("platform", sa.String(length=20), nullable=False),
        sa.Column("app_version", sa.String(length=50), nullable=True),
        sa.Column("device_model", sa.String(length=255), nullable=True),
        sa.Column("locale", sa.String(length=32), nullable=True),
        sa.Column("timezone", sa.String(length=64), nullable=True),
        sa.Column("user_agent", sa.String(length=1000), nullable=True),
        sa.Column("notifications_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("is_anonymous", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_authenticated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notification_installations_id"), "notification_installations", ["id"], unique=False)
    op.create_index(op.f("ix_notification_installations_installation_id"), "notification_installations", ["installation_id"], unique=True)
    op.create_index(op.f("ix_notification_installations_actor_type"), "notification_installations", ["actor_type"], unique=False)
    op.create_index(op.f("ix_notification_installations_actor_id"), "notification_installations", ["actor_id"], unique=False)
    op.create_index(op.f("ix_notification_installations_platform"), "notification_installations", ["platform"], unique=False)

    op.create_table(
        "notification_tokens",
        sa.Column("installation_db_id", sa.Integer(), nullable=False),
        sa.Column("channel", sa.String(length=20), nullable=False, server_default="push"),
        sa.Column("provider", sa.String(length=50), nullable=False, server_default="firebase"),
        sa.Column("token", sa.String(length=2048), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_registered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_success_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_failure_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("invalidated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failure_reason", sa.String(length=255), nullable=True),
        sa.Column("delivery_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("failure_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["installation_db_id"], ["notification_installations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("provider", "token_hash", name="uq_notification_token_provider_hash"),
    )
    op.create_index(op.f("ix_notification_tokens_id"), "notification_tokens", ["id"], unique=False)
    op.create_index(op.f("ix_notification_tokens_installation_db_id"), "notification_tokens", ["installation_db_id"], unique=False)
    op.create_index(op.f("ix_notification_tokens_channel"), "notification_tokens", ["channel"], unique=False)
    op.create_index(op.f("ix_notification_tokens_provider"), "notification_tokens", ["provider"], unique=False)
    op.create_index(op.f("ix_notification_tokens_token_hash"), "notification_tokens", ["token_hash"], unique=False)
    op.create_index(op.f("ix_notification_tokens_is_active"), "notification_tokens", ["is_active"], unique=False)

    op.create_table(
        "notification_preferences",
        sa.Column("installation_db_id", sa.Integer(), nullable=False),
        sa.Column("push_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("realtime_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("transactional_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("marketing_enabled", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("system_enabled", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("quiet_hours_start", sa.String(length=5), nullable=True),
        sa.Column("quiet_hours_end", sa.String(length=5), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["installation_db_id"], ["notification_installations.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("installation_db_id"),
    )
    op.create_index(op.f("ix_notification_preferences_id"), "notification_preferences", ["id"], unique=False)
    op.create_index(op.f("ix_notification_preferences_installation_db_id"), "notification_preferences", ["installation_db_id"], unique=False)

    op.create_table(
        "notification_deliveries",
        sa.Column("installation_db_id", sa.Integer(), nullable=True),
        sa.Column("token_db_id", sa.Integer(), nullable=True),
        sa.Column("actor_type", sa.String(length=20), nullable=True),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("channel", sa.String(length=20), nullable=False),
        sa.Column("provider", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False, server_default="transactional"),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("data_json", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="queued"),
        sa.Column("attempt_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("provider_message_id", sa.String(length=255), nullable=True),
        sa.Column("error_code", sa.String(length=100), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("opened_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("clicked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("failed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("created_by", sa.String(length=100), nullable=True),
        sa.Column("updated_by", sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(["installation_db_id"], ["notification_installations.id"]),
        sa.ForeignKeyConstraint(["token_db_id"], ["notification_tokens.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notification_deliveries_id"), "notification_deliveries", ["id"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_installation_db_id"), "notification_deliveries", ["installation_db_id"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_token_db_id"), "notification_deliveries", ["token_db_id"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_actor_type"), "notification_deliveries", ["actor_type"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_actor_id"), "notification_deliveries", ["actor_id"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_channel"), "notification_deliveries", ["channel"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_provider"), "notification_deliveries", ["provider"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_category"), "notification_deliveries", ["category"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_status"), "notification_deliveries", ["status"], unique=False)
    op.create_index(op.f("ix_notification_deliveries_provider_message_id"), "notification_deliveries", ["provider_message_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notification_deliveries_provider_message_id"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_status"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_category"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_provider"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_channel"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_actor_id"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_actor_type"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_token_db_id"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_installation_db_id"), table_name="notification_deliveries")
    op.drop_index(op.f("ix_notification_deliveries_id"), table_name="notification_deliveries")
    op.drop_table("notification_deliveries")

    op.drop_index(op.f("ix_notification_preferences_installation_db_id"), table_name="notification_preferences")
    op.drop_index(op.f("ix_notification_preferences_id"), table_name="notification_preferences")
    op.drop_table("notification_preferences")

    op.drop_index(op.f("ix_notification_tokens_is_active"), table_name="notification_tokens")
    op.drop_index(op.f("ix_notification_tokens_token_hash"), table_name="notification_tokens")
    op.drop_index(op.f("ix_notification_tokens_provider"), table_name="notification_tokens")
    op.drop_index(op.f("ix_notification_tokens_channel"), table_name="notification_tokens")
    op.drop_index(op.f("ix_notification_tokens_installation_db_id"), table_name="notification_tokens")
    op.drop_index(op.f("ix_notification_tokens_id"), table_name="notification_tokens")
    op.drop_table("notification_tokens")

    op.drop_index(op.f("ix_notification_installations_platform"), table_name="notification_installations")
    op.drop_index(op.f("ix_notification_installations_actor_id"), table_name="notification_installations")
    op.drop_index(op.f("ix_notification_installations_actor_type"), table_name="notification_installations")
    op.drop_index(op.f("ix_notification_installations_installation_id"), table_name="notification_installations")
    op.drop_index(op.f("ix_notification_installations_id"), table_name="notification_installations")
    op.drop_table("notification_installations")
