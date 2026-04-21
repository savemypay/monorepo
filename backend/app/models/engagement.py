from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


EventType = Literal["view", "click", "cta_click"]


class AdInteractionCaptureRequest(BaseModel):
    event_type: EventType = "click"
    session_id: str | None = Field(default=None, max_length=128)
    referrer: str | None = Field(default=None, max_length=1000)
    occurred_at: datetime | None = None
    meta: dict[str, Any] | None = None
