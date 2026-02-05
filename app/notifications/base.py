from abc import ABC, abstractmethod


class SmsProvider(ABC):
    @abstractmethod
    def send_sms(self, to: str, message: str) -> None:
        raise NotImplementedError


class EmailProvider(ABC):
    @abstractmethod
    def send_email(self, to: str, subject: str, body_text: str, body_html: str | None = None) -> None:
        raise NotImplementedError
