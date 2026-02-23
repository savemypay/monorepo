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
        self.client = boto3.client("ses", 
                                   region_name=region,
                                   aws_access_key_id="AKIAVUJWBJ2RXMIXBHP7",
                                    aws_secret_access_key="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", 
                                   config=retry_cfg)

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

            response = self.client.send_email(
                Destination={"ToAddresses": [to]},
                Message={
                    "Subject": {"Data": subject},
                    "Body": body,
                },
                Source=self.from_email,
            )
            metadata = response.get("ResponseMetadata") or {}
            logger.info(
                "[Email][ses] sent to=%s message_id=%s status_code=%s request_id=%s",
                to,
                response.get("MessageId"),
                metadata.get("HTTPStatusCode"),
                metadata.get("RequestId"),
            )
        except (BotoCoreError, ClientError) as exc:
            error_code = None
            error_message = None
            if isinstance(exc, ClientError):
                error = (exc.response or {}).get("Error") or {}
                error_code = error.get("Code")
                error_message = error.get("Message")
            logger.exception(
                "[Email][ses] failed to=%s error_code=%s error_message=%s error=%s",
                to,
                error_code,
                error_message,
                exc,
            )
            raise
