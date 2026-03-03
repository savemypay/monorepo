from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr | None = None
    phone_number: str | None = Field(default=None, max_length=30)

    @property
    def identifier(self) -> str:
        return self.email or self.phone_number or ""

    def require_identifier(self) -> None:
        if not self.email and not self.phone_number:
            raise ValueError("Either email or phone_number must be provided")


class OTPVerifyRequest(LoginRequest):
    code: str = Field(..., min_length=4, max_length=10)
    referral_code: str | None = Field(default=None, min_length=4, max_length=20)


class LoginResponseData(BaseModel):
    expires_in_minutes: int


class VerifyResponseData(BaseModel):
    identifier: str
    access_token: str
    access_token_expires_in: int
    refresh_token: str
    refresh_token_expires_in: int
    token_type: str
    user: dict | None = None
    role: str
    user_id: str
    vendor_id: str | None = None
    vendor: dict | None = None
    is_new_user: bool


class ErrorPayload(BaseModel):
    code: str | int | None = None
    details: Any | None = None


T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    success: bool
    message: str
    data: list[T]
    error: Optional[ErrorPayload] = None


class LoginResponse(ApiResponse[LoginResponseData]):
    pass


class VerifyResponse(ApiResponse[VerifyResponseData]):
    pass


class LogoutRequest(BaseModel):
    refresh_token: str = Field(..., min_length=10)
