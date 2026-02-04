from fastapi import APIRouter

from . import foo
from .endpoints import router as endpoints_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(foo.router)
api_router.include_router(endpoints_router)

__all__ = ["api_router"]
