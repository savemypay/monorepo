import logging

from app.notifications.base import SmsProvider, EmailProvider

logger = logging.getLogger(__name__)


class ConsoleSmsProvider(SmsProvider):
    def send_sms(self, to: str, message: str) -> None:
        logger.info("[SMS][console] to=%s message=%s", to, message)


class ConsoleEmailProvider(EmailProvider):
    def send_email(self, to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
        logger.info("[Email][console] to=%s subject=%s body=%s", to, subject, body_text)
