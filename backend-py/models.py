from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ─── AUTH ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str


class TokenResponse(BaseModel):
    token: str
    user: UserOut


# ─── LISTINGS ────────────────────────────────────────────────────────────────

class ListingCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=120)
    location: str = Field(..., min_length=3)
    description: Optional[str] = None
    price_per_hour: float = Field(..., gt=0)
    type: str = Field(default="driveway")          # driveway | garage | lot
    vehicle_type: str = Field(default="both")      # 2-wheeler | 4-wheeler | both
    lat: Optional[float] = None
    lng: Optional[float] = None


class ListingResponse(BaseModel):
    id: str
    title: str
    location: str
    description: Optional[str]
    price_per_hour: float
    type: str
    vehicle_type: str
    lat: Optional[float]
    lng: Optional[float]
    available: bool
    image_url: Optional[str]
    owner_id: Optional[str]
    created_at: str


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    price_per_hour: Optional[float] = None
    type: Optional[str] = None
    vehicle_type: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    available: Optional[bool] = None


# ─── BOOKINGS ────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    listing_id: str
    start_time: str                          # e.g. "14:30"
    duration_hours: float = Field(..., gt=0)
    vehicle_type: str                        # 2-wheeler | 4-wheeler
    total_cost: float = Field(..., gt=0)


class BookingResponse(BaseModel):
    id: str
    listing_id: str
    renter_id: str
    start_time: str
    duration_hours: float
    vehicle_type: str
    total_cost: float
    status: str
    created_at: str
