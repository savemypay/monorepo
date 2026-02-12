from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import JWT_ALGORITHM, JWT_SECRET_KEY
from app.utils.response import error_response

bearer_scheme = HTTPBearer(auto_error=True)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Invalid token", code="invalid_token", details=str(exc)),
        ) from exc


def get_current_vendor_id(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> int:
    payload = decode_token(creds.credentials)
    if payload.get("role") != "vendor":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Vendor token required", code="invalid_token"),
        )
    vendor_id = payload.get("vendor_id") or payload.get("sub")
    if not vendor_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Token missing vendor_id", code="invalid_token"),
        )
    try:
        return int(vendor_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Invalid vendor_id in token", code="invalid_token"),
        ) from exc


def get_current_admin_or_vendor(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    payload = decode_token(creds.credentials)
    role = payload.get("role")
    if role not in ("admin", "vendor"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Admin or vendor token required", code="invalid_token"),
        )
    return payload


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Allow any authenticated role (customer/vendor/admin)."""
    return decode_token(creds.credentials)


def get_current_customer(
    creds: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    payload = decode_token(creds.credentials)
    if payload.get("role") != "customer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error_response(message="Customer token required", code="invalid_token"),
        )
    return payload
