import logging

from app.notifications.base import NotificationMessage, ProviderDeliveryResult, RealtimeProvider

logger = logging.getLogger(__name__)


class NoopRealtimeProvider(RealtimeProvider):
    def send_realtime(self, channel_key: str, message: NotificationMessage) -> ProviderDeliveryResult:
        logger.info(
            "[Realtime][noop] channel=%s title=%s body=%s data=%s",
            channel_key,
            message.title,
            message.body,
            message.data,
        )
        return ProviderDeliveryResult(success=True)
