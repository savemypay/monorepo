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
