import asyncio
import logging
from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal
from app.entities.ad import Ad

logger = logging.getLogger(__name__)


def _seconds_until_next_run(run_hour: int = 0, run_minute: int = 1) -> float:
    now = datetime.now().astimezone()
    next_run = now.replace(hour=run_hour, minute=run_minute, second=0, microsecond=0)
    if now >= next_run:
        next_run = next_run + timedelta(days=1)
    return max((next_run - now).total_seconds(), 0.0)


def expire_ads_once() -> int:
    db = SessionLocal()
    try:
        now_utc = datetime.now(timezone.utc)
        logger.info("[ads] expire_ads_once started now_utc=%s", now_utc.isoformat())
        affected = (
            db.query(Ad)
            .filter(
                Ad.valid_to.isnot(None),
                Ad.valid_to <= now_utc,
                ((Ad.status != "expired") | (Ad.is_active.is_(True))),
            )
            .update(
                {
                    Ad.status: "expired",
                    Ad.is_active: False,
                    Ad.updated_by: "ad_expirer",
                },
                synchronize_session=False,
            )
        )
        db.commit()
        logger.info("[ads] expire_ads_once finished now_utc=%s affected=%s", now_utc.isoformat(), affected or 0)
        return int(affected or 0)
    except Exception:
        logger.exception("[ads] expire_ads_once failed")
        db.rollback()
        raise
    finally:
        db.close()
        logger.debug("[ads] expire_ads_once db session closed")


async def ad_expirer_daily(run_hour: int = 0, run_minute: int = 1):
    """Runs once every day at configured local server time."""
    try:
        while True:
            sleep_for = _seconds_until_next_run(run_hour=run_hour, run_minute=run_minute)
            logger.info(
                "[ads] ad_expirer sleeping for %.0f seconds until next run at %02d:%02d",
                sleep_for,
                run_hour,
                run_minute,
            )
            await asyncio.sleep(sleep_for)

            try:
                affected = expire_ads_once()
                logger.info("[ads] ad_expirer completed expired_ads=%s", affected)
            except Exception:
                logger.exception("[ads] error while expiring ads")
    except asyncio.CancelledError:
        logger.info("[ads] ad_expirer task cancelled")
        raise
