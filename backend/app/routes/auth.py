from fastapi import APIRouter, HTTPException, Form
from app.core.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup")
def signup(email: str = Form(...), password: str = Form(...)):
    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        return {"message": "User created", "user": res.user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(email: str = Form(...), password: str = Form(...)):
    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        return {
            "access_token": res.session.access_token,
            "user": res.user
        }

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")