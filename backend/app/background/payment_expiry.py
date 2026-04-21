import asyncio
import logging

from app.db.session import SessionLocal
from app.services.payment import expire_stale_payments

logger = logging.getLogger(__name__)


async def payment_expirer(interval_seconds: int = 60):
    """Background task to expire stale payments and release slots."""
    try:
        while True:
            try:
                db = SessionLocal()
                released = expire_stale_payments(db, vendor_id=None)
                if released:
                    logger.info("[payments] expired stale payments, slots released=%s", released)
            except Exception:
                logger.exception("[payments] error while expiring stale payments")
            finally:
                db.close()
            await asyncio.sleep(interval_seconds)
    except asyncio.CancelledError:
        logger.info("[payments] payment_expirer task cancelled")
        raise
