from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import logging
import contextlib

from app.api.v1 import api_router
from app.core.config import (
    APPLICATION_PORT,
    APPLICATION_HOST,
    ALLOWED_ORIGINS,
    ALLOWED_HOSTS,
    ROOT_PATH,
)
from app.utils.response import error_response
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from app.middleware.logging import RequestLoggingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.background.payment_expiry import payment_expirer
from app.background.ad_expiry import ad_expirer_daily

logger = logging.getLogger(__name__)

app = FastAPI(root_path=ROOT_PATH)

# Middlewares
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(api_router)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict):
        content = detail
    else:
        content = error_response(message=str(detail), code=exc.status_code, details=None)
    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    content = error_response(message="Internal Server Error", code="internal_error", details=str(exc))
    return JSONResponse(status_code=500, content=content)


@app.on_event("startup")
async def start_background_tasks():
    logger.info("Server startUp")
    # app.state.ad_expirer_task = asyncio.create_task(ad_expirer_daily(run_hour=0, run_minute=1))
    # logger.info("Started ad_expirer daily background task")
    # app.state.payment_expirer_task = asyncio.create_task(payment_expirer())
    # logger.info("payment_expirer background task is disabled")


@app.on_event("shutdown")
async def stop_background_tasks():
    ad_task = getattr(app.state, "ad_expirer_task", None)
    if ad_task:
        ad_task.cancel()
        with contextlib.suppress(Exception):
            await ad_task
        logger.info("Stopped ad_expirer background task")

    # payment_task = getattr(app.state, "payment_expirer_task", None)
    # if payment_task:
    #     payment_task.cancel()
    #     with contextlib.suppress(Exception):
    #         await payment_task
    #     logger.info("Stopped payment_expirer background task")


if __name__ == "__main__":
    uvicorn.run(app, host=APPLICATION_HOST, port=APPLICATION_PORT)
