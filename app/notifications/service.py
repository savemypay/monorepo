from __future__ import annotations

import hashlib
import json
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import NOTIFICATION_BATCH_SIZE
from app.entities.notification_delivery import NotificationDelivery
from app.entities.notification_installation import NotificationInstallation
from app.entities.notification_preference import NotificationPreference
from app.entities.notification_token import NotificationToken
from app.notifications.base import NotificationMessage, ProviderDeliveryResult
from app.notifications.factory import get_push_provider, get_realtime_provider

logger = logging.getLogger(__name__)
VALID_ACTOR_TYPES = {"customer", "vendor", "admin"}
VALID_PLATFORMS = {"android", "ios", "web"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _token_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


@dataclass(slots=True)
class InstallationRegistration:
    installation_id: str
    platform: str
    actor_type: str | None = None
    actor_id: int | None = None
    app_version: str | None = None
    device_model: str | None = None
    locale: str | None = None
    timezone: str | None = None
    user_agent: str | None = None


@dataclass(slots=True)
class PushTokenRegistration:
    installation_id: str
    token: str
    provider: str = "firebase"
    channel: str = "push"


@dataclass(slots=True)
class PreferenceUpdate:
    installation_id: str
    push_enabled: bool | None = None
    realtime_enabled: bool | None = None
    transactional_enabled: bool | None = None
    marketing_enabled: bool | None = None
    system_enabled: bool | None = None
    quiet_hours_start: str | None = None
    quiet_hours_end: str | None = None


class NotificationService:
    def __init__(self, db: Session, *, push_provider=None, realtime_provider=None) -> None:
        self.db = db
        self.push_provider = push_provider or get_push_provider()
        self.realtime_provider = realtime_provider or get_realtime_provider()

    def register_installation(self, payload: InstallationRegistration) -> NotificationInstallation:
        self._validate_installation_payload(payload)
        installation = (
            self.db.query(NotificationInstallation)
            .filter(NotificationInstallation.installation_id == payload.installation_id)
            .first()
        )
        now = _now()

        if installation is None:
            installation = NotificationInstallation(
                installation_id=payload.installation_id,
                platform=payload.platform,
                created_by="notification_registration",
            )

        installation.installation_id = payload.installation_id
        installation.platform = payload.platform
        installation.actor_type = payload.actor_type
        installation.actor_id = payload.actor_id
        installation.is_anonymous = payload.actor_type is None or payload.actor_id is None
        installation.app_version = payload.app_version
        installation.device_model = payload.device_model
        installation.locale = payload.locale
        installation.timezone = payload.timezone
        installation.user_agent = payload.user_agent
        installation.last_seen_at = now
        if not installation.is_anonymous:
            installation.last_authenticated_at = now
        installation.updated_by = "notification_registration"

        self.db.add(installation)
        self.db.commit()
        self.db.refresh(installation)
        return installation

    def bind_installation_actor(self, installation_id: str, *, actor_type: str, actor_id: int) -> NotificationInstallation:
        actor_type = self._validate_actor(actor_type=actor_type, actor_id=actor_id)
        installation = self._get_installation(installation_id)
        installation.actor_type = actor_type
        installation.actor_id = actor_id
        installation.is_anonymous = False
        installation.last_authenticated_at = _now()
        installation.last_seen_at = installation.last_authenticated_at
        installation.updated_by = "notification_bind_actor"
        self.db.add(installation)
        self.db.commit()
        self.db.refresh(installation)
        return installation

    def unbind_installation_actor(self, installation_id: str) -> NotificationInstallation:
        installation = self._get_installation(installation_id)
        installation.actor_type = None
        installation.actor_id = None
        installation.is_anonymous = True
        installation.last_seen_at = _now()
        installation.updated_by = "notification_unbind_actor"
        self.db.add(installation)
        self.db.commit()
        self.db.refresh(installation)
        return installation

    def register_push_token(self, payload: PushTokenRegistration) -> NotificationToken:
        installation = self._get_installation(payload.installation_id)
        now = _now()
        hashed = _token_hash(payload.token)

        token_row = (
            self.db.query(NotificationToken)
            .filter(
                NotificationToken.provider == payload.provider,
                NotificationToken.token_hash == hashed,
            )
            .first()
        )

        if token_row is None:
            token_row = NotificationToken(
                installation_db_id=installation.id,
                provider=payload.provider,
                channel=payload.channel,
                token=payload.token,
                token_hash=hashed,
                created_by="notification_token_registration",
            )

        (
            self.db.query(NotificationToken)
            .filter(
                NotificationToken.installation_db_id == installation.id,
                NotificationToken.provider == payload.provider,
                NotificationToken.channel == payload.channel,
                NotificationToken.is_active.is_(True),
                NotificationToken.token_hash != hashed,
            )
            .update(
                {
                    NotificationToken.is_active: False,
                    NotificationToken.invalidated_at: now,
                    NotificationToken.failure_reason: "superseded_by_new_token",
                    NotificationToken.updated_by: "notification_token_rotation",
                },
                synchronize_session=False,
            )
        )

        token_row.installation_db_id = installation.id
        token_row.provider = payload.provider
        token_row.channel = payload.channel
        token_row.token = payload.token
        token_row.token_hash = hashed
        token_row.is_active = True
        token_row.invalidated_at = None
        token_row.failure_reason = None
        token_row.last_registered_at = now
        token_row.updated_by = "notification_token_registration"

        installation.last_seen_at = now
        installation.updated_by = "notification_token_registration"

        self.db.add(installation)
        self.db.add(token_row)
        self.db.commit()
        self.db.refresh(token_row)
        return token_row

    def deactivate_push_token(self, *, token: str, reason: str) -> None:
        hashed = _token_hash(token)
        now = _now()
        (
            self.db.query(NotificationToken)
            .filter(NotificationToken.token_hash == hashed)
            .update(
                {
                    NotificationToken.is_active: False,
                    NotificationToken.invalidated_at: now,
                    NotificationToken.failure_reason: reason,
                    NotificationToken.updated_by: "notification_token_deactivation",
                },
                synchronize_session=False,
            )
        )
        self.db.commit()

    def upsert_preferences(self, payload: PreferenceUpdate) -> NotificationPreference:
        self._validate_preference_payload(payload)
        installation = self._get_installation(payload.installation_id)
        preference = (
            self.db.query(NotificationPreference)
            .filter(NotificationPreference.installation_db_id == installation.id)
            .first()
        )
        if preference is None:
            preference = NotificationPreference(
                installation_db_id=installation.id,
                created_by="notification_preferences",
            )

        for field_name in (
            "push_enabled",
            "realtime_enabled",
            "transactional_enabled",
            "marketing_enabled",
            "system_enabled",
            "quiet_hours_start",
            "quiet_hours_end",
        ):
            value = getattr(payload, field_name)
            if value is not None:
                setattr(preference, field_name, value)

        preference.updated_by = "notification_preferences"
        self.db.add(preference)
        self.db.commit()
        self.db.refresh(preference)
        return preference

    def send_push_to_actor(
        self,
        *,
        actor_type: str,
        actor_id: int,
        message: NotificationMessage,
        category: str = "transactional",
    ) -> list[NotificationDelivery]:
        rows = (
            self.db.query(NotificationToken, NotificationInstallation, NotificationPreference)
            .join(NotificationInstallation, NotificationInstallation.id == NotificationToken.installation_db_id)
            .outerjoin(NotificationPreference, NotificationPreference.installation_db_id == NotificationInstallation.id)
            .filter(
                NotificationInstallation.actor_type == actor_type,
                NotificationInstallation.actor_id == actor_id,
                NotificationToken.is_active.is_(True),
                NotificationInstallation.notifications_enabled.is_(True),
            )
            .order_by(NotificationToken.id.desc())
            .limit(NOTIFICATION_BATCH_SIZE)
            .all()
        )
        deliveries: list[NotificationDelivery] = []

        for token_row, installation, preference in rows:
            if not self._preference_allows(preference, channel="push", category=category):
                continue
            delivery = self._create_delivery(
                installation=installation,
                token_row=token_row,
                channel="push",
                provider=token_row.provider,
                category=category,
                message=message,
            )
            result = self.push_provider.send_push(token_row.token, message)
            self._apply_delivery_result(delivery=delivery, token_row=token_row, result=result)
            deliveries.append(delivery)

        self.db.commit()
        return deliveries

    def send_push_to_installation(
        self,
        *,
        installation_id: str,
        message: NotificationMessage,
        category: str = "system",
    ) -> list[NotificationDelivery]:
        installation = self._get_installation(installation_id)
        if not bool(installation.notifications_enabled):
            return []
        rows = (
            self.db.query(NotificationToken, NotificationPreference)
            .outerjoin(NotificationPreference, NotificationPreference.installation_db_id == NotificationToken.installation_db_id)
            .filter(
                NotificationToken.installation_db_id == installation.id,
                NotificationToken.is_active.is_(True),
            )
            .order_by(NotificationToken.id.desc())
            .limit(NOTIFICATION_BATCH_SIZE)
            .all()
        )
        deliveries: list[NotificationDelivery] = []
        for token_row, preference in rows:
            if not self._preference_allows(preference, channel="push", category=category):
                continue
            delivery = self._create_delivery(
                installation=installation,
                token_row=token_row,
                channel="push",
                provider=token_row.provider,
                category=category,
                message=message,
            )
            result = self.push_provider.send_push(token_row.token, message)
            self._apply_delivery_result(delivery=delivery, token_row=token_row, result=result)
            deliveries.append(delivery)

        self.db.commit()
        return deliveries

    def send_realtime_to_actor(
        self,
        *,
        actor_type: str,
        actor_id: int,
        message: NotificationMessage,
        category: str = "transactional",
    ) -> NotificationDelivery:
        channel_key = f"{actor_type}:{actor_id}"
        delivery = NotificationDelivery(
            actor_type=actor_type,
            actor_id=actor_id,
            channel="realtime",
            provider=self.realtime_provider.__class__.__name__,
            category=category,
            title=message.title,
            body=message.body,
            data_json=json.dumps(message.data or {}),
            status="queued",
            created_by="notification_realtime_send",
        )
        self.db.add(delivery)
        result = self.realtime_provider.send_realtime(channel_key, message)
        self._apply_delivery_result(delivery=delivery, token_row=None, result=result)
        self.db.commit()
        self.db.refresh(delivery)
        return delivery

    def send_realtime_to_installation(
        self,
        *,
        installation_id: str,
        message: NotificationMessage,
        category: str = "system",
    ) -> NotificationDelivery:
        installation = self._get_installation(installation_id)
        channel_key = f"installation:{installation.installation_id}"
        delivery = self._create_delivery(
            installation=installation,
            token_row=None,
            channel="realtime",
            provider=self.realtime_provider.__class__.__name__,
            category=category,
            message=message,
        )
        result = self.realtime_provider.send_realtime(channel_key, message)
        self._apply_delivery_result(delivery=delivery, token_row=None, result=result)
        self.db.commit()
        self.db.refresh(delivery)
        return delivery

    def _get_installation(self, installation_id: str) -> NotificationInstallation:
        installation = (
            self.db.query(NotificationInstallation)
            .filter(NotificationInstallation.installation_id == installation_id)
            .first()
        )
        if installation is None:
            raise ValueError(f"Installation not found: {installation_id}")
        return installation

    def _validate_installation_payload(self, payload: InstallationRegistration) -> None:
        payload.installation_id = payload.installation_id.strip()
        if not payload.installation_id:
            raise ValueError("installation_id is required")
        platform = payload.platform.strip().lower()
        if platform not in VALID_PLATFORMS:
            raise ValueError(f"Unsupported platform: {payload.platform}")
        payload.platform = platform
        if (payload.actor_type is None) != (payload.actor_id is None):
            raise ValueError("actor_type and actor_id must be provided together")
        if payload.actor_type is not None and payload.actor_id is not None:
            payload.actor_type = self._validate_actor(actor_type=payload.actor_type, actor_id=payload.actor_id)

    def _validate_actor(self, *, actor_type: str, actor_id: int) -> str:
        actor_type = actor_type.strip().lower()
        if actor_type not in VALID_ACTOR_TYPES:
            raise ValueError(f"Unsupported actor_type: {actor_type}")
        if actor_id <= 0:
            raise ValueError("actor_id must be > 0")
        return actor_type

    def _validate_preference_payload(self, payload: PreferenceUpdate) -> None:
        for field_name in ("quiet_hours_start", "quiet_hours_end"):
            value = getattr(payload, field_name)
            if value is None:
                continue
            if len(value) != 5 or value[2] != ":":
                raise ValueError(f"Invalid {field_name}; expected HH:MM")
            hours, minutes = value.split(":")
            if not hours.isdigit() or not minutes.isdigit():
                raise ValueError(f"Invalid {field_name}; expected HH:MM")
            if not (0 <= int(hours) <= 23 and 0 <= int(minutes) <= 59):
                raise ValueError(f"Invalid {field_name}; expected HH:MM")

    def _create_delivery(
        self,
        *,
        installation: NotificationInstallation,
        token_row: NotificationToken | None,
        channel: str,
        provider: str,
        category: str,
        message: NotificationMessage,
    ) -> NotificationDelivery:
        delivery = NotificationDelivery(
            installation_db_id=installation.id,
            token_db_id=token_row.id if token_row else None,
            actor_type=installation.actor_type,
            actor_id=installation.actor_id,
            channel=channel,
            provider=provider,
            category=category,
            title=message.title,
            body=message.body,
            data_json=json.dumps(message.data or {}),
            status="queued",
            created_by="notification_send",
        )
        self.db.add(delivery)
        return delivery

    def _apply_delivery_result(
        self,
        *,
        delivery: NotificationDelivery,
        token_row: NotificationToken | None,
        result: ProviderDeliveryResult,
    ) -> None:
        now = _now()
        delivery.attempt_count = int(delivery.attempt_count or 0) + 1
        delivery.provider_message_id = result.provider_message_id
        delivery.error_code = result.error_code
        delivery.error_message = result.error_message
        delivery.updated_by = "notification_send"

        if result.success:
            delivery.status = "sent"
            delivery.sent_at = now
            if token_row is not None:
                token_row.last_success_at = now
                token_row.delivery_count = int(token_row.delivery_count or 0) + 1
                token_row.updated_by = "notification_send"
        else:
            delivery.status = "failed"
            delivery.failed_at = now
            if token_row is not None:
                token_row.last_failure_at = now
                token_row.failure_count = int(token_row.failure_count or 0) + 1
                token_row.failure_reason = result.error_message or result.error_code
                token_row.updated_by = "notification_send"
                if result.error_code in {"registration-token-not-registered", "invalid-registration-token", "UnregisteredError"}:
                    token_row.is_active = False
                    token_row.invalidated_at = now

        self.db.add(delivery)
        if token_row is not None:
            self.db.add(token_row)

    def _preference_allows(self, preference: NotificationPreference | None, *, channel: str, category: str) -> bool:
        if preference is None:
            return True
        if channel == "push" and not bool(preference.push_enabled):
            return False
        if channel == "realtime" and not bool(preference.realtime_enabled):
            return False
        if category == "marketing" and not bool(preference.marketing_enabled):
            return False
        if category == "transactional" and not bool(preference.transactional_enabled):
            return False
        if category == "system" and not bool(preference.system_enabled):
            return False
        return True
