from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

app = FastAPI(root_path=ROOT_PATH)

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


if __name__ == "__main__":
    uvicorn.run(app, host=APPLICATION_HOST, port=APPLICATION_PORT)
