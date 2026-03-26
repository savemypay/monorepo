import logging

from app.core.config import PAYMENT_PROVIDER
from app.payments.providers.mock import MockPaymentProvider

try:
    from app.payments.providers.stripe import StripePaymentProvider
except Exception:  # pragma: no cover - optional import
    StripePaymentProvider = None  # type: ignore
try:
    from app.payments.providers.razorpay import RazorpayPaymentProvider
except Exception:  # pragma: no cover - optional import
    RazorpayPaymentProvider = None  # type: ignore

logger = logging.getLogger(__name__)


def get_payment_provider():
    provider = PAYMENT_PROVIDER.lower()
    if provider == "stripe" and StripePaymentProvider:
        return StripePaymentProvider()
    if provider == "razorpay" and RazorpayPaymentProvider:
        return RazorpayPaymentProvider()
    if provider == "mock":
        return MockPaymentProvider()
    logger.warning("Unknown PAYMENT_PROVIDER '%s', defaulting to mock", PAYMENT_PROVIDER)
    return MockPaymentProvider()
