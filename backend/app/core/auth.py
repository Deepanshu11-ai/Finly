from fastapi import Header, HTTPException
from app.core.supabase_client import supabase


def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        token = authorization.split(" ")[1]
        user = supabase.auth.get_user(token)

        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user.user.id

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")