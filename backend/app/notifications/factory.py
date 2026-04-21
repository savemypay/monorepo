import logging

from app.core.config import SMS_PROVIDER, EMAIL_PROVIDER, PUSH_PROVIDER, REALTIME_PROVIDER
from app.notifications.providers import (
    ConsoleSmsProvider,
    ConsoleEmailProvider,
    ConsolePushProvider,
    FirebasePushProvider,
    NoopRealtimeProvider,
    SnsSmsProvider,
    SmsCountryProvider,
    SesEmailProvider,
    WebSocketRealtimeProvider,
)

logger = logging.getLogger(__name__)


def get_sms_provider():
    provider = SMS_PROVIDER.lower()
    if provider == "sns":
        return SnsSmsProvider()
    if provider == "smscountry":
        return SmsCountryProvider()
    if provider == "console":
        return ConsoleSmsProvider()
    logger.warning("Unknown SMS_PROVIDER '%s', falling back to console", SMS_PROVIDER)
    return ConsoleSmsProvider()


def get_email_provider():
    provider = EMAIL_PROVIDER.lower()
    if provider == "ses":
        return SesEmailProvider()
    if provider == "console":
        return ConsoleEmailProvider()
    logger.warning("Unknown EMAIL_PROVIDER '%s', falling back to console", EMAIL_PROVIDER)
    return ConsoleEmailProvider()


def get_push_provider():
    provider = PUSH_PROVIDER.lower()
    if provider == "firebase":
        return FirebasePushProvider()
    if provider == "console":
        return ConsolePushProvider()
    logger.warning("Unknown PUSH_PROVIDER '%s', falling back to console", PUSH_PROVIDER)
    return ConsolePushProvider()


def get_realtime_provider(registry=None):
    provider = REALTIME_PROVIDER.lower()
    if provider == "websocket":
        if registry is None:
            raise ValueError("WebSocket registry is required for REALTIME_PROVIDER=websocket")
        return WebSocketRealtimeProvider(registry)
    if provider == "noop":
        return NoopRealtimeProvider()
    logger.warning("Unknown REALTIME_PROVIDER '%s', falling back to noop", REALTIME_PROVIDER)
    return NoopRealtimeProvider()
