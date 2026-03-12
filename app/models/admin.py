from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.auth import ApiResponse


class AdminLoginRequest(BaseModel):
    username: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = None
    password: str = Field(..., min_length=6)

    @model_validator(mode="after")
    def validate_identifier(self):
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")
        return self


class AdminLoginData(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    user_id: str


class AdminLoginResponse(ApiResponse[AdminLoginData]):
    pass


class AdminUserEntry(BaseModel):
    id: int
    role: Literal["customer", "vendor"]
    name: str | None = None
    email: str | None = None
    phone_number: str | None = None
    is_active: bool
    created_at: datetime | None = None


class AdminUsersListData(BaseModel):
    role_filter: Literal["all", "customer", "vendor"]
    total_customers: int
    total_vendors: int
    total_count: int
    customers: list[AdminUserEntry]
    vendors: list[AdminUserEntry]


class AdminUsersListResponse(ApiResponse[AdminUsersListData]):
    pass
