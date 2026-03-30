from fastapi import Header, HTTPException, status
from database import supabase


def get_current_user(authorization: str = Header(...)):
    """FastAPI dependency — validates the Bearer token from Supabase Auth
    and returns (user, raw_token) for downstream use."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Use: Bearer <token>",
        )
    token = authorization.split(" ", 1)[1].strip()
    try:
        response = supabase.auth.get_user(jwt=token)
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        return response.user, token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate token: {str(e)}",
        )
