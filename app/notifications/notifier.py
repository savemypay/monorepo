from app.notifications.factory import get_sms_provider, get_email_provider


def send_sms(to: str, message: str) -> None:
    provider = get_sms_provider()
    provider.send_sms(to, message)


def send_email(to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
    provider = get_email_provider()
    provider.send_email(to, subject, body_text, body_html)
