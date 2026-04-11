from fastapi import Header, HTTPException
from app.core.supabase_client import supabase


def get_current_user(authorization: str = Header(None)):
    """Verify JWT token and return user ID"""
    if not authorization:
        raise HTTPException(
            status_code=401, 
            detail="Missing authentication token. Please login first."
        )

    try:
        # Extract token from "Bearer <token>" format
        if not authorization.startswith("Bearer "):
            raise ValueError("Invalid token format")
        
        token = authorization.split(" ", 1)[1]
        user = supabase.auth.get_user(token)

        if not user or not user.user:
            raise HTTPException(
                status_code=401, 
                detail="Invalid or expired token. Please login again."
            )

        return user.user.id

    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail="Authentication failed. Please login again."
        )