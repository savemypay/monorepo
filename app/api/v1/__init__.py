from fastapi import APIRouter

from app.api.v1 import foo

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(foo.router)
