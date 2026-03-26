from __future__ import annotations

import json
import logging
from typing import Any

from app.core.config import FIREBASE_CREDENTIALS_FILE, FIREBASE_CREDENTIALS_JSON, FIREBASE_PROJECT_ID
from app.notifications.base import NotificationMessage, ProviderDeliveryResult, PushProvider

logger = logging.getLogger(__name__)


class FirebasePushProvider(PushProvider):
    def __init__(
        self,
        *,
        project_id: str = FIREBASE_PROJECT_ID,
        credentials_file: str = FIREBASE_CREDENTIALS_FILE,
        credentials_json: str = FIREBASE_CREDENTIALS_JSON,
    ) -> None:
        self.project_id = project_id
        self._messaging, self._app = self._build_sdk(credentials_file=credentials_file, credentials_json=credentials_json)

    def _build_sdk(self, *, credentials_file: str, credentials_json: str) -> tuple[Any, Any]:
        try:
            import firebase_admin
            from firebase_admin import credentials, messaging
        except ImportError as exc:
            raise RuntimeError("firebase-admin is not installed") from exc

        if not firebase_admin._apps:
            if credentials_json:
                cred = credentials.Certificate(json.loads(credentials_json))
            elif credentials_file:
                cred = credentials.Certificate(credentials_file)
            else:
                raise RuntimeError("Firebase credentials are not configured")
            app = firebase_admin.initialize_app(cred, {"projectId": self.project_id} if self.project_id else None)
        else:
            app = firebase_admin.get_app()

        return messaging, app

    def send_push(self, token: str, message: NotificationMessage) -> ProviderDeliveryResult:
        if not token:
            return ProviderDeliveryResult(success=False, error_code="missing_token", error_message="Push token is required")

        firebase_message = self._messaging.Message(
            token=token,
            notification=self._messaging.Notification(
                title=message.title,
                body=message.body,
                image=message.image_url,
            ),
            data=message.data,
        )

        try:
            provider_message_id = self._messaging.send(firebase_message, app=self._app)
            logger.info("[Push][firebase] sent token=%s message_id=%s", token, provider_message_id)
            return ProviderDeliveryResult(success=True, provider_message_id=provider_message_id)
        except Exception as exc:
            logger.exception("[Push][firebase] failed token=%s error=%s", token, exc)
            return ProviderDeliveryResult(
                success=False,
                error_code=exc.__class__.__name__,
                error_message=str(exc),
            )
