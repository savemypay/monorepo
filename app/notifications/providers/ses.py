import logging
import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import AWS_REGION, FROM_EMAIL
from app.notifications.base import EmailProvider

logger = logging.getLogger(__name__)


class SesEmailProvider(EmailProvider):
    def __init__(self, region: str = AWS_REGION, from_email: str | None = FROM_EMAIL) -> None:
        self.from_email = from_email
        retry_cfg = Config(retries={"max_attempts": 3, "mode": "standard"})
        self.client = boto3.client("ses", region_name=region, config=retry_cfg)

    def send_email(self, to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
        if not self.from_email:
            raise ValueError("FROM_EMAIL must be configured for SES emails")
        if not to:
            raise ValueError("Destination email is required")
        if not subject:
            raise ValueError("Email subject is required")
        if not body_text:
            raise ValueError("Email body_text is required")

        try:
            body = {"Text": {"Data": body_text}}
            if body_html:
                body["Html"] = {"Data": body_html}

            self.client.send_email(
                Destination={"ToAddresses": [to]},
                Message={
                    "Subject": {"Data": subject},
                    "Body": body,
                },
                Source=self.from_email,
            )
            logger.info("[Email][ses] sent to=%s", to)
        except (BotoCoreError, ClientError) as exc:
            logger.exception("[Email][ses] failed to=%s error=%s", to, exc)
            raise
