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
