from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, listings, bookings

app = FastAPI(
    title="ParkShare API",
    description="Peer-to-peer parking space rental platform — FastAPI + Supabase",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── LOGGING MIDDLEWARE ───────────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request, call_next):
    import time
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"DEBUG: {request.method} {request.url.path} - Status: {response.status_code} - Done in {duration:.4f}s")
    return response

# ─── ROUTERS ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)


# ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "message": "ParkShare FastAPI backend is running!"}
