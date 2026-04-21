import logging

from starlette.concurrency import run_in_threadpool

from app.notifications.factory import get_sms_provider, get_email_provider

logger = logging.getLogger(__name__)


def send_sms(to: str, message: str) -> None:
    provider = get_sms_provider()
    provider.send_sms(to, message)


def send_email(to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
    provider = get_email_provider()
    provider_name = provider.__class__.__name__
    logger.info("[Email] dispatch provider=%s to=%s subject=%s", provider_name, to, subject)
    try:
        provider.send_email(to, subject, body_text, body_html)
        logger.info("[Email] dispatch success provider=%s to=%s", provider_name, to)
    except Exception as exc:
        logger.exception("[Email] dispatch failed provider=%s to=%s error=%s", provider_name, to, exc)
        raise


async def send_sms_async(to: str, message: str) -> None:
    """Non-blocking wrapper for async endpoints."""
    await run_in_threadpool(send_sms, to, message)


async def send_email_async(to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
    """Non-blocking wrapper for async endpoints."""
    await run_in_threadpool(send_email, to, subject, body_text, body_html)
