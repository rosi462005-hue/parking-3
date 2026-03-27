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
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── ROUTERS ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(listings.router)
app.include_router(bookings.router)


# ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
def health():
    return {"status": "ok", "message": "ParkShare FastAPI backend is running!"}
