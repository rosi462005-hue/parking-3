from fastapi import APIRouter, HTTPException, Depends
from database import supabase, get_user_client
from models import BookingCreate, BookingResponse
from dependencies import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("/", response_model=list[BookingResponse])
async def get_my_bookings(current=Depends(get_current_user)):
    """Return all bookings belonging to the logged-in user."""
    user, token = current
    db = get_user_client(token)
    response = (
        db.table("bookings")
        .select("*")
        .eq("renter_id", str(user.id))
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(body: BookingCreate, current=Depends(get_current_user)):
    """Create a booking and mark the listing as unavailable."""
    user, token = current
    db = get_user_client(token)

    # 1. Verify listing exists and is available
    listing_resp = (
        supabase.table("listings")
        .select("id, available")
        .eq("id", body.listing_id)
        .single()
        .execute()
    )
    if not listing_resp.data:
        raise HTTPException(status_code=404, detail="Listing not found.")
    if not listing_resp.data.get("available"):
        raise HTTPException(status_code=409, detail="This parking spot is no longer available.")

    # 2. Create the booking
    booking_payload = {
        **body.model_dump(),
        "renter_id": str(user.id),
        "status": "confirmed",
    }
    booking_resp = db.table("bookings").insert(booking_payload).execute()
    if not booking_resp.data:
        raise HTTPException(status_code=500, detail="Failed to create booking.")

    # 3. Mark listing as unavailable (use service client to bypass RLS for owner-locked row)
    supabase.table("listings").update({"available": False}).eq("id", body.listing_id).execute()

    return booking_resp.data[0]


@router.delete("/{booking_id}", status_code=204)
async def cancel_booking(booking_id: str, current=Depends(get_current_user)):
    """Cancel a booking and free up the listing again."""
    user, token = current
    db = get_user_client(token)

    # 1. Fetch the booking to get listing_id
    booking_resp = (
        db.table("bookings")
        .select("listing_id, renter_id")
        .eq("id", booking_id)
        .eq("renter_id", str(user.id))
        .single()
        .execute()
    )
    if not booking_resp.data:
        raise HTTPException(status_code=404, detail="Booking not found or not yours.")

    listing_id = booking_resp.data["listing_id"]

    # 2. Update status to cancelled
    db.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()

    # 3. Free up the listing
    supabase.table("listings").update({"available": True}).eq("id", listing_id).execute()
