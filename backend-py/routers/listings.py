import os
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import Optional
from database import supabase, get_user_client, SUPABASE_URL
from models import ListingCreate, ListingResponse, ListingUpdate
from dependencies import get_current_user

router = APIRouter(prefix="/api/listings", tags=["listings"])

BUCKET = "listing-images"


def _upload_image(file: UploadFile, owner_id: str) -> str:
    """Upload image to Supabase Storage and return the public URL."""
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"{owner_id}/{os.urandom(8).hex()}.{ext}"
    content = file.file.read()
    supabase.storage.from_(BUCKET).upload(
        path,
        content,
        file_options={"content-type": file.content_type or "image/jpeg"},
    )
    public_url = supabase.storage.from_(BUCKET).get_public_url(path)
    return public_url


# ─── GET ALL LISTINGS ────────────────────────────────────────────────────────

@router.get("/", response_model=list[ListingResponse])
async def get_listings(vehicle_type: Optional[str] = None):
    """Return all available listings. Optionally filter by vehicle_type."""
    query = supabase.table("listings").select("*").eq("available", True).order("created_at", desc=True)
    if vehicle_type:
        # Match exact type OR 'both'
        query = query.in_("vehicle_type", [vehicle_type, "both"])
    response = query.execute()
    return response.data or []


# ─── GET SINGLE LISTING ──────────────────────────────────────────────────────

@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str):
    response = supabase.table("listings").select("*").eq("id", listing_id).single().execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return response.data


# ─── CREATE LISTING (JSON) ───────────────────────────────────────────────────

@router.post("/", response_model=ListingResponse, status_code=201)
async def create_listing(body: ListingCreate, current=Depends(get_current_user)):
    """Create a new listing. Requires authentication."""
    user, token = current
    db = get_user_client(token)
    payload = {
        **body.model_dump(),
        "owner_id": str(user.id),
        "available": True,
    }
    response = db.table("listings").insert(payload).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create listing.")
    return response.data[0]


# ─── CREATE LISTING WITH IMAGE (multipart/form-data) ─────────────────────────

@router.post("/with-image", response_model=ListingResponse, status_code=201)
async def create_listing_with_image(
    title: str = Form(...),
    location: str = Form(...),
    price_per_hour: float = Form(...),
    type: str = Form("driveway"),
    vehicle_type: str = Form("both"),
    description: Optional[str] = Form(None),
    lat: Optional[float] = Form(None),
    lng: Optional[float] = Form(None),
    image: Optional[UploadFile] = File(None),
    current=Depends(get_current_user),
):
    """Create a listing that includes an image upload to Supabase Storage."""
    user, token = current
    db = get_user_client(token)

    image_url = None
    if image and image.filename:
        try:
            image_url = _upload_image(image, str(user.id))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {e}")

    payload = {
        "title": title,
        "location": location,
        "price_per_hour": price_per_hour,
        "type": type,
        "vehicle_type": vehicle_type,
        "description": description,
        "lat": lat,
        "lng": lng,
        "image_url": image_url,
        "owner_id": str(user.id),
        "available": True,
    }
    response = db.table("listings").insert(payload).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create listing.")
    return response.data[0]


# ─── UPDATE LISTING ──────────────────────────────────────────────────────────

@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    body: ListingUpdate,
    current=Depends(get_current_user),
):
    user, token = current
    db = get_user_client(token)
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")
    response = (
        db.table("listings")
        .update(updates)
        .eq("id", listing_id)
        .eq("owner_id", str(user.id))
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Listing not found or you are not the owner.")
    return response.data[0]


# ─── DELETE LISTING ──────────────────────────────────────────────────────────

@router.delete("/{listing_id}", status_code=204)
async def delete_listing(listing_id: str, current=Depends(get_current_user)):
    user, token = current
    db = get_user_client(token)
    db.table("listings").delete().eq("id", listing_id).eq("owner_id", str(user.id)).execute()
