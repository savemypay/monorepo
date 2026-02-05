from fastapi import APIRouter

from app.api.v1.endpoints import customer_interest, vendor, category

router = APIRouter()
router.include_router(customer_interest.router)
router.include_router(vendor.router)
router.include_router(category.router)
