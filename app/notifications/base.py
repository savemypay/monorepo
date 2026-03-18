from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


class SmsProvider(ABC):
    @abstractmethod
    def send_sms(self, to: str, message: str) -> None:
        raise NotImplementedError


class EmailProvider(ABC):
    @abstractmethod
    def send_email(self, to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
        raise NotImplementedError


@dataclass(slots=True)
class NotificationMessage:
    title: str
    body: str
    data: dict[str, str] = field(default_factory=dict)
    image_url: str | None = None


@dataclass(slots=True)
class ProviderDeliveryResult:
    success: bool
    provider_message_id: str | None = None
    canonical_token: str | None = None
    error_code: str | None = None
    error_message: str | None = None
    raw_response: dict[str, Any] | None = None


class PushProvider(ABC):
    @abstractmethod
    def send_push(self, token: str, message: NotificationMessage) -> ProviderDeliveryResult:
        raise NotImplementedError


class RealtimeProvider(ABC):
    @abstractmethod
    def send_realtime(self, channel_key: str, message: NotificationMessage) -> ProviderDeliveryResult:
        raise NotImplementedError
