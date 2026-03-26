import logging
import time
import requests

from app.core.config import SMSCOUNTRY_API_KEY, SMSCOUNTRY_SENDER
from app.notifications.base import SmsProvider

logger = logging.getLogger(__name__)


class SmsCountryProvider(SmsProvider):
    BASE_URL = "https://api.smscountry.com/v0.1/Accounts/{api_key}/SMSes"

    def __init__(self, api_key: str = SMSCOUNTRY_API_KEY, sender: str = SMSCOUNTRY_SENDER) -> None:
        self.api_key = api_key
        self.sender = sender

    def send_sms(self, to: str, message: str) -> None:
        if not self.api_key or not self.sender:
            raise ValueError("SMSCOUNTRY_API_KEY and SMSCOUNTRY_SENDER must be configured")
        if not to:
            raise ValueError("Destination phone number is required")
        if not message:
            raise ValueError("Message cannot be empty")

        url = self.BASE_URL.format(api_key=self.api_key)
        payload = {
            "Text": message,
            "Number": to,
            "SenderId": self.sender,
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

        for attempt in range(3):
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=10)
                if resp.ok:
                    logger.info("[SMS][smscountry] sent to=%s", to)
                    return
                logger.error("[SMS][smscountry] failed to=%s status=%s body=%s", to, resp.status_code, resp.text)
            except requests.RequestException as exc:
                logger.exception("[SMS][smscountry] error to=%s attempt=%s err=%s", to, attempt + 1, exc)

            if attempt < 2:
                time.sleep(0.5 * (2 ** attempt))
                continue
            # last attempt failed
            if 'resp' in locals() and not resp.ok:
                resp.raise_for_status()
            raise
