from fastapi import APIRouter


foo_router = APIRouter()


@foo_router.get("/")
async def root():
    return {"message": "Hello World, test"}