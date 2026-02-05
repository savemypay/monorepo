import logging
import boto3
from botocore.exceptions import BotoCoreError, ClientError

from app.core.config import AWS_REGION
from app.notifications.base import SmsProvider

logger = logging.getLogger(__name__)


class SnsSmsProvider(SmsProvider):
    def __init__(self, region: str = AWS_REGION) -> None:
        self.client = boto3.client("sns", region_name=region)

    def send_sms(self, to: str, message: str) -> None:
        try:
            self.client.publish(PhoneNumber=to, Message=message)
            logger.info("[SMS][sns] sent to=%s", to)
        except (BotoCoreError, ClientError) as exc:
            logger.exception("[SMS][sns] failed to=%s error=%s", to, exc)
            raise
