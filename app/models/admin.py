from pydantic import BaseModel, Field

from app.models.auth import ApiResponse


class AdminLoginRequest(BaseModel):
    username: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6)


class AdminLoginData(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    role: str
    user_id: str


class AdminLoginResponse(ApiResponse[AdminLoginData]):
    pass
