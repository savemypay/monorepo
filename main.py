from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.v1 import api_router
from app.core.config import (
    APPLICATION_PORT,
    APPLICATION_HOST,
    ALLOWED_ORIGINS,
    ALLOWED_HOSTS,
)
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

app = FastAPI()

# Middlewares
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router)


if __name__ == "__main__":
    uvicorn.run(app, host=APPLICATION_HOST, port=APPLICATION_PORT)
