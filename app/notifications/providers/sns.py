import logging
import boto3
from botocore.config import Config
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import AWS_REGION
from app.notifications.base import SmsProvider

logger = logging.getLogger(__name__)


class SnsSmsProvider(SmsProvider):
    def __init__(self, region: str = AWS_REGION) -> None:
        retry_cfg = Config(retries={"max_attempts": 3, "mode": "standard"})
        self.client = boto3.client("sns", region_name=region, config=retry_cfg)

    def send_sms(self, to: str, message: str) -> None:
        if not to or not to.startswith("+"):
            raise ValueError("SNS SMS requires E.164 formatted phone number (e.g., +15551234567)")
        if not message:
            raise ValueError("Message cannot be empty")
        try:
            self.client.publish(PhoneNumber=to, Message=message)
            logger.info("[SMS][sns] sent to=%s", to)
        except (BotoCoreError, ClientError) as exc:
            logger.exception("[SMS][sns] failed to=%s error=%s", to, exc)
            raise
