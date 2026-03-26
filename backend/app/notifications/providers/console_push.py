import logging

from app.notifications.base import NotificationMessage, ProviderDeliveryResult, PushProvider

logger = logging.getLogger(__name__)


class ConsolePushProvider(PushProvider):
    def send_push(self, token: str, message: NotificationMessage) -> ProviderDeliveryResult:
        logger.info(
            "[Push][console] token=%s title=%s body=%s data=%s",
            token,
            message.title,
            message.body,
            message.data,
        )
        return ProviderDeliveryResult(success=True)
