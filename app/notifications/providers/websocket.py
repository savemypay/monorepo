from __future__ import annotations

import logging
from abc import ABC, abstractmethod

from app.notifications.base import NotificationMessage, ProviderDeliveryResult, RealtimeProvider

logger = logging.getLogger(__name__)


class WebSocketRegistry(ABC):
    @abstractmethod
    def broadcast(self, channel_key: str, payload: dict) -> bool:
        raise NotImplementedError


class WebSocketRealtimeProvider(RealtimeProvider):
    def __init__(self, registry: WebSocketRegistry) -> None:
        self.registry = registry

    def send_realtime(self, channel_key: str, message: NotificationMessage) -> ProviderDeliveryResult:
        payload = {
            "title": message.title,
            "body": message.body,
            "data": message.data,
            "image_url": message.image_url,
        }
        delivered = self.registry.broadcast(channel_key, payload)
        if delivered:
            logger.info("[Realtime][websocket] delivered channel=%s", channel_key)
            return ProviderDeliveryResult(success=True)
        logger.warning("[Realtime][websocket] no active subscribers channel=%s", channel_key)
        return ProviderDeliveryResult(success=False, error_code="no_active_subscribers", error_message="No active subscribers")
