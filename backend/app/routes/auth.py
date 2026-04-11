from fastapi import APIRouter, HTTPException, Form, Header
from app.core.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(email: str = Form(...), password: str = Form(...)):
    """Create a new user account"""
    try:
        if len(password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
        
        res = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        return {"message": "User created successfully! Please check your email to verify your account."}
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "already registered" in error_msg.lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=error_msg)


@router.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    """Login user and return access token"""
    try:
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if not res.session or not res.session.access_token:
            raise HTTPException(status_code=401, detail="Login failed - invalid response")

        return {
            "access_token": res.session.access_token,
            "email": email
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid email or password")


@router.post("/logout")
def logout(authorization: str = Header(None)):
    """Logout user (token is invalidated on client side)"""
    try:
        if not authorization:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        token = authorization.split(" ")[1]
        supabase.auth.sign_out()
        
        return {"message": "Logged out successfully"}
    except Exception as e:
        return {"message": "Logged out successfully"}  # Always return success for logout