from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

from app.models.auth import ApiResponse
from app.models.ad import AdTierOut


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


class AdminVendorAdRevenueEntry(BaseModel):
    id: int
    vendor_id: int
    title: str
    product_name: str | None = None
    category: str
    token_amount: float
    original_price: float
    total_qty: int
    slots_remaining: int
    slots_sold: int
    status: str
    description: str | None = None
    terms: str | None = None
    valid_from: datetime | None = None
    valid_to: datetime | None = None
    is_favorite: bool = False
    tiers: list[AdTierOut]
    revenue_generated: float
    successful_payments: int


class AdminVendorAdsRevenueData(BaseModel):
    vendor_id: int
    vendor_name: str | None = None
    vendor_email: str | None = None
    vendor_phone_number: str | None = None
    total_ads: int
    vendor_total_revenue: float
    ads: list[AdminVendorAdRevenueEntry]


class AdminVendorAdsRevenueResponse(ApiResponse[AdminVendorAdsRevenueData]):
    pass
