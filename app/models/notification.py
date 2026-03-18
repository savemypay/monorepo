from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.models.auth import ApiResponse


class InstallationRegisterRequest(BaseModel):
    installation_id: str = Field(..., min_length=8, max_length=128)
    platform: str = Field(..., pattern="^(android|ios|web)$")
    app_version: str | None = Field(default=None, max_length=50)
    device_model: str | None = Field(default=None, max_length=255)
    locale: str | None = Field(default=None, max_length=32)
    timezone: str | None = Field(default=None, max_length=64)


class PushTokenRegisterRequest(BaseModel):
    installation_id: str = Field(..., min_length=8, max_length=128)
    token: str = Field(..., min_length=16, max_length=2048)
    provider: str = Field(default="firebase", min_length=2, max_length=50)
    channel: str = Field(default="push", pattern="^push$")


class PushTokenDeactivateRequest(BaseModel):
    installation_id: str = Field(..., min_length=8, max_length=128)
    token: str = Field(..., min_length=16, max_length=2048)
    reason: str | None = Field(default=None, max_length=255)


class NotificationPreferenceUpdateRequest(BaseModel):
    installation_id: str = Field(..., min_length=8, max_length=128)
    push_enabled: bool | None = None
    realtime_enabled: bool | None = None
    transactional_enabled: bool | None = None
    marketing_enabled: bool | None = None
    system_enabled: bool | None = None
    quiet_hours_start: str | None = Field(default=None, min_length=5, max_length=5)
    quiet_hours_end: str | None = Field(default=None, min_length=5, max_length=5)

    @model_validator(mode="after")
    def validate_at_least_one_field(self):
        if all(
            value is None
            for value in (
                self.push_enabled,
                self.realtime_enabled,
                self.transactional_enabled,
                self.marketing_enabled,
                self.system_enabled,
                self.quiet_hours_start,
                self.quiet_hours_end,
            )
        ):
            raise ValueError("At least one preference field must be provided")
        return self


class NotificationInstallationData(BaseModel):
    id: int
    installation_id: str
    platform: str
    actor_type: str | None
    actor_id: int | None
    is_anonymous: bool
    notifications_enabled: bool
    app_version: str | None
    device_model: str | None
    locale: str | None
    timezone: str | None
    user_agent: str | None
    last_seen_at: datetime | None
    last_authenticated_at: datetime | None


class NotificationTokenData(BaseModel):
    id: int
    installation_id: str
    channel: str
    provider: str
    is_active: bool
    last_registered_at: datetime | None
    last_success_at: datetime | None
    last_failure_at: datetime | None
    invalidated_at: datetime | None
    failure_reason: str | None


class NotificationPreferenceData(BaseModel):
    installation_id: str
    push_enabled: bool
    realtime_enabled: bool
    transactional_enabled: bool
    marketing_enabled: bool
    system_enabled: bool
    quiet_hours_start: str | None
    quiet_hours_end: str | None


class NotificationInstallationResponse(ApiResponse[NotificationInstallationData]):
    pass


class NotificationTokenResponse(ApiResponse[NotificationTokenData]):
    pass


class NotificationPreferenceResponse(ApiResponse[NotificationPreferenceData]):
    pass
