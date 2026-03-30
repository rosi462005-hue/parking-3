import time
import os
import re
import urllib.request
import urllib.parse
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from database import supabase, get_user_client
from models import BookingCreate, BookingResponse
from dependencies import get_current_user

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

def send_booking_sms_sync(phone_number: str, time: str, duration: float, vehicle: str):
    """Utility function to send SMS via external provider safely."""
    logger.info(f"Attempting to trigger SMS... Original matched number: {phone_number}")
    api_key = os.environ.get("SMS_API_KEY")
    api_url = os.environ.get("SMS_API_URL")
    
    # Sanitize and validate length natively
    clean_phone = re.sub(r'[^\d+]', '', phone_number)
    if not clean_phone or len(clean_phone) < 10:
        logger.error(f"Cannot dispatch SMS: Invalid extracted phone number format '{clean_phone}'")
        return
        
    if not api_key or not api_url:
        logger.warning(f"SMS configuration variables missing in environment. Aborting SMS to {clean_phone}.")
        return

    message = (
        f"Your parking space has been booked.\n"
        f"Time: {time}\n"
        f"Duration: {duration} hour(s)\n"
        f"Vehicle: {vehicle}"
    )

    try:
        data = urllib.parse.urlencode({
            'apikey': api_key,
            'numbers': phone_number,
            'message': message,
            'sender': 'PRKSHR'
        }).encode('utf-8')
        
        req = urllib.request.Request(api_url, data=data, method='POST')
        with urllib.request.urlopen(req, timeout=15) as response:
            if response.status not in (200, 201):
                logger.error(f"Failed to transmit SMS payload to provider. Gateway returned status: {response.status}")
            else:
                logger.info(f"SMS message successfully dispatched to {clean_phone}")
    except Exception as e:
        logger.error(f"Critical operational error during SMS outbound request: {str(e)}", exc_info=True)


@router.get("/owner")
async def get_owner_bookings(current=Depends(get_current_user)):
    """Return all bookings created against spaces owned by the logged-in user."""
    start_time = time.time()
    user, token = current
    logger.info(f"Fetching owner bookings for: {user.id}")
    try:
        response = (
            supabase.table("bookings")
            .select("*, listings!inner(owner_id, title, price_per_hour, location)")
            .eq("listings.owner_id", str(user.id))
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    finally:
        logger.info(f"Owner bookings finished in {time.time() - start_time:.4f}s")

@router.get("/", response_model=list[BookingResponse])
async def get_my_bookings(current=Depends(get_current_user)):
    """Return all bookings belonging to the logged-in user."""
    start_time = time.time()
    user, token = current
    logger.info(f"Fetching renter bookings for: {user.id}")
    try:
        db = get_user_client(token)
        response = (
            db.table("bookings")
            .select("*")
            .eq("renter_id", str(user.id))
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []
    finally:
        logger.info(f"My bookings finished in {time.time() - start_time:.4f}s")


@router.post("/", response_model=BookingResponse, status_code=201)
async def create_booking(body: BookingCreate, background_tasks: BackgroundTasks, current=Depends(get_current_user)):
    """Create a booking and mark the listing as unavailable."""
    start_time = time.time()
    user, token = current
    logger.info(f"Creating booking for listing {body.listing_id}")
    try:
        db = get_user_client(token)

        # 1. Verify listing exists and is available
        listing_resp = (
            supabase.table("listings")
            .select("id, available, phone_number")
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

        # 4. Trigger SMS notification safely in background without blocking
        try:
            owner_phone = listing_resp.data.get("phone_number")
            
            if owner_phone:
                owner_phone = str(owner_phone).strip()
                logger.info(f"Successfully located owner contact mapping from dedicated field: {owner_phone}. Queuing notification task.")
                background_tasks.add_task(
                    send_booking_sms_sync, 
                    phone_number=owner_phone,
                    time=body.start_time,
                    duration=body.duration_hours,
                    vehicle=body.vehicle_type
                )
            else:
                logger.info("No SMS notification triggered: 'phone_number' field is empty or missing in the listing record.")
        except Exception as sms_err:
            logger.error(f"Failed to prepare SMS background task: {str(sms_err)}", exc_info=True)
    finally:
        logger.info(f"Create booking finished in {time.time() - start_time:.4f}s")

    return booking_resp.data[0]


@router.delete("/{booking_id}", status_code=204)
async def cancel_booking(booking_id: str, current=Depends(get_current_user)):
    """Cancel a booking and free up the listing again."""
    user, token = current
    db = get_user_client(token)

    # 1. Fetch the booking to get listing_id and current status
    booking_resp = (
        db.table("bookings")
        .select("listing_id, renter_id, status")
        .eq("id", booking_id)
        .eq("renter_id", str(user.id))
        .single()
        .execute()
    )
    if not booking_resp.data:
        raise HTTPException(status_code=404, detail="Booking not found or not yours.")

    if booking_resp.data["status"] == "cancelled":
        raise HTTPException(status_code=400, detail="Booking is already cancelled.")

    listing_id = booking_resp.data["listing_id"]

    # 2. Update status to cancelled
    db.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()

    # 3. Free up the listing
    supabase.table("listings").update({"available": True}).eq("id", listing_id).execute()
