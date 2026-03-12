from fastapi import APIRouter

from app.api.v1.endpoints import (
    ad,
    analytics,
    auth,
    category,
    customer_interest,
    customer_purchases,
    engagement,
    game,
    paid_users,
    payment,
    payment_maintenance,
    profile,
    vendor,
)

router = APIRouter()
router.include_router(customer_interest.router)
router.include_router(vendor.router)
router.include_router(category.router)
router.include_router(analytics.router)
router.include_router(auth.router)
router.include_router(payment.router)
router.include_router(ad.router)
router.include_router(paid_users.router)
router.include_router(payment_maintenance.router)
router.include_router(customer_purchases.router)
router.include_router(profile.router)
router.include_router(game.router)
router.include_router(engagement.router)
