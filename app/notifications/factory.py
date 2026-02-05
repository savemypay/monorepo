import logging

from app.core.config import SMS_PROVIDER, EMAIL_PROVIDER
from app.notifications.providers import (
    ConsoleSmsProvider,
    ConsoleEmailProvider,
    SnsSmsProvider,
    SmsCountryProvider,
    SesEmailProvider,
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
