from typing import Any, Optional

from pydantic import BaseModel, Field
from datetime import datetime

from app.models.auth import ApiResponse


class PaymentInitRequest(BaseModel):
    amount: int = Field(..., gt=0, description="Amount in minor units (e.g., cents)")
    currency: Optional[str] = Field(default=None, min_length=3, max_length=10)
    customer_ref: Optional[str] = Field(default=None, description="Customer identifier in provider")
    deal_ref: Optional[str] = Field(default=None, description="Internal deal/signup reference")
    metadata: Optional[dict[str, Any]] = Field(default=None)


class PaymentResponseData(BaseModel):
    id: int
    provider: str
    provider_order_id: Optional[str] = None
    provider_payment_id: Optional[str] = None
    status: str
    amount: int
    currency: str
    idempotency_key: str
    client_secret: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None


class PaymentInitResponse(ApiResponse[PaymentResponseData]):
    pass


class PaidUserEntry(BaseModel):
    payment_id: int
    order_id: Optional[str] = None
    deal_ref: Optional[str]
    customer_ref: Optional[str]
    amount: int
    currency: str
    status: str
    created_at: datetime
    ad: Optional[dict] = None
    user_email: Optional[str] = None
    user_phone_number: Optional[str] = None
    user_name: Optional[str] = None

    class Config:
        orm_mode = True


class PaidUsersResponse(ApiResponse[PaidUserEntry]):
    pass


class DashboardSummaryData(BaseModel):
    active_ads: int
    total_leads: int
    total_revenue: float


class DashboardSummaryResponse(ApiResponse[DashboardSummaryData]):
    pass
