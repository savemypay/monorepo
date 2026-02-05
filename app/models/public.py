from pydantic import BaseModel, EmailStr, Field


class CustomerInterestCreate(BaseModel):
    name: str | None = Field(default=None, max_length=255)
    email: EmailStr
    phone_number: str | None = None
    # country_code removed


class VendorCreate(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    phone_number: str
    country_code: str | None = Field(default=None, max_length=10)
    category: str = Field(..., max_length=100)
    comments: str | None = Field(default=None, max_length=1000)
