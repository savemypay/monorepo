import logging
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import AWS_REGION
from app.notifications.base import EmailProvider

logger = logging.getLogger(__name__)


class SesEmailProvider(EmailProvider):
    def __init__(self, region: str = AWS_REGION) -> None:
        self.client = boto3.client("ses", region_name=region)

    def send_email(self, to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
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
                Source=to if False else None,  # placeholder; Source must be a verified sender
            )
            logger.info("[Email][ses] sent to=%s", to)
        except (BotoCoreError, ClientError) as exc:
            logger.exception("[Email][ses] failed to=%s error=%s", to, exc)
            raise
