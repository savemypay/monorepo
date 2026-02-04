from pydantic import BaseModel, EmailStr, Field


class CustomerInterestCreate(BaseModel):
    email: EmailStr
    phone_number: str | None = None
    country_code: str | None = Field(default=None, max_length=10)


class VendorCreate(BaseModel):
    name: str = Field(..., max_length=255)
    email: EmailStr
    phone_number: str
    country_code: str | None = Field(default=None, max_length=10)
    address: str | None = Field(default=None, max_length=500)
    category_id: int
    comments: str | None = Field(default=None, max_length=1000)
