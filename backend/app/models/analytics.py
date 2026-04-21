from typing import Literal

from pydantic import BaseModel

from app.models.auth import ApiResponse


Granularity = Literal["day", "week", "month", "year"]
UserRole = Literal["customer", "vendor"]


class OnboardingTrendPoint(BaseModel):
    period_start: str
    period_end: str
    new_users: int
    cumulative_users: int


class OnboardingTrendData(BaseModel):
    granularity: Granularity
    role: UserRole
    date_from: str
    date_to: str
    total_new_users: int
    total_users_till_to_date: int
    trend: list[OnboardingTrendPoint]


class OnboardingTrendResponse(ApiResponse[OnboardingTrendData]):
    pass


class AdCategoryCountPoint(BaseModel):
    category: str
    ads_count: int


class AdCategoryAnalyticsData(BaseModel):
    category_filter: str | None = None
    vendor_id: int | None = None
    total_ads: int
    by_category: list[AdCategoryCountPoint]


class AdCategoryAnalyticsResponse(ApiResponse[AdCategoryAnalyticsData]):
    pass


class TransactionTrendPoint(BaseModel):
    period_start: str
    period_end: str
    transactions_count: int
    unique_paying_users: int
    paid_amount: float
    cumulative_paid_amount: float


class TransactionsAnalyticsData(BaseModel):
    granularity: Granularity
    date_from: str
    date_to: str
    vendor_id: int | None = None
    total_transactions: int
    total_unique_paying_users: int
    total_paid_amount: float
    trend: list[TransactionTrendPoint]


class TransactionsAnalyticsResponse(ApiResponse[TransactionsAnalyticsData]):
    pass


class DashboardOverviewData(BaseModel):
    live_deals: int
    pending_approval: int
    collections_today: float
    active_vendors: int
    new_customers: int
    failed_payments: int
    new_customers_window_days: int = 15


class DashboardOverviewResponse(ApiResponse[DashboardOverviewData]):
    pass
