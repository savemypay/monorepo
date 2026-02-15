from fastapi import APIRouter

from app.api.v1.endpoints import customer_interest, vendor, category, auth, payment, ad, paid_users, payment_maintenance, customer_purchases, profile

router = APIRouter()
router.include_router(customer_interest.router)
router.include_router(vendor.router)
router.include_router(category.router)
router.include_router(auth.router)
router.include_router(payment.router)
router.include_router(ad.router)
router.include_router(paid_users.router)
router.include_router(payment_maintenance.router)
router.include_router(customer_purchases.router)
router.include_router(profile.router)
