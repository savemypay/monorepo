from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, conint, confloat, validator

from app.models.auth import ApiResponse


class AdTierIn(BaseModel):
    seq: conint(ge=1)
    qty: conint(ge=1)
    discount_pct: confloat(ge=0, le=100) = 0
    label: Optional[str] = None


class AdCreate(BaseModel):
    title: str = Field(..., max_length=255)
    product_name: Optional[str] = Field(default=None, max_length=255)
    original_price: float = Field(..., gt=0)
    token_amount: float = Field(..., gt=0)
    total_qty: conint(ge=1)
    tiers: List[AdTierIn]
    category: str = Field(..., max_length=100)
    images: Optional[List[str]] = None
    description: Optional[str] = None
    terms: Optional[str] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    vendor_id: Optional[int] = Field(default=None, description="Required when admin creates on behalf of vendor")

    @validator("tiers")
    def validate_tiers(cls, v, values):
        total_qty = values.get("total_qty")
        if not v:
            raise ValueError("At least one tier is required")
        seqs = [t.seq for t in v]
        if len(seqs) != len(set(seqs)):
            raise ValueError("Tier seq values must be unique")
        if total_qty and sum(t.qty for t in v) != total_qty:
            raise ValueError("Sum of tier qty must equal total_qty")
        return v


class AdTierOut(BaseModel):
    id: int
    seq: int
    qty: int
    discount_pct: float
    label: Optional[str]

    class Config:
        orm_mode = True


class AdOut(BaseModel):
    id: int
    vendor_id: int
    title: str
    product_name: Optional[str]
    category: str
    token_amount: float
    original_price: float
    total_qty: int
    slots_remaining: int
    slots_sold: int
    status: str
    images: Optional[list[str]]
    description: Optional[str]
    terms: Optional[str]
    valid_from: Optional[datetime]
    valid_to: Optional[datetime]
    is_favorite: bool = False
    tiers: List[AdTierOut]

    class Config:
        orm_mode = True


class AdResponse(ApiResponse[AdOut]):
    pass


class AdListResponse(ApiResponse[AdOut]):
    pass


class ImageAttachRequest(BaseModel):
    key: str
    public_url: Optional[str] = None


class FavoriteUpdateRequest(BaseModel):
    is_favorite: bool = True
