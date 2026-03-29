from fastapi import APIRouter, HTTPException, status
from database import supabase
from models import UserRegister, UserLogin, TokenResponse, UserOut
from dependencies import get_current_user
from fastapi import Depends

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: UserRegister):
    """Create a new Supabase Auth user and return a JWT token."""
    try:
        response = supabase.auth.sign_up({
            "email": body.email,
            "password": body.password,
            "options": {
                "data": {"name": body.name}
            }
        })
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    user = response.user
    session = response.session

    if not user:
        raise HTTPException(status_code=400, detail="Registration failed. Email may already be in use.")

    # Token might be None if email confirmation is required.
    # We handle both cases gracefully.
    token = session.access_token if session else ""

    return TokenResponse(
        token=token,
        user=UserOut(
            id=str(user.id),
            name=body.name,
            email=user.email,
        )
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    """Authenticate with email + password and return a JWT token."""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": body.email,
            "password": body.password,
        })
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    user = response.user
    session = response.session

    if not user or not session:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    # Fetch profile name (safely skip if database isn't fully ready yet)
    name = user.email.split("@")[0]
    try:
        profile_resp = supabase.table("profiles").select("name").eq("id", str(user.id)).single().execute()
        if hasattr(profile_resp, 'data') and profile_resp.data:
            name = profile_resp.data.get("name", name)
    except Exception as e:
        print(f"Warning: Profile lookup failed: {e}")

    return TokenResponse(
        token=session.access_token,
        user=UserOut(
            id=str(user.id),
            name=name,
            email=user.email,
        )
    )


@router.get("/me", response_model=UserOut)
async def get_me(current=Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    user, token = current
    profile_resp = supabase.table("profiles").select("name").eq("id", str(user.id)).single().execute()
    name = profile_resp.data.get("name", user.email.split("@")[0]) if profile_resp.data else user.email.split("@")[0]
    return UserOut(id=str(user.id), name=name, email=user.email)
