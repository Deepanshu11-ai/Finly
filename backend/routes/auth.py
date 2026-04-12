from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.auth_service import signup_user, login_user, logout_user
router = APIRouter(prefix="/auth", tags=["Auth"])


class AuthRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(data: AuthRequest):
    res = signup_user(data.email, data.password)

    if res.user:
        return {"message": "User created"}

    raise HTTPException(status_code=400, detail="Signup failed")


@router.post("/login")
def login(data: AuthRequest):
    res = login_user(data.email, data.password)

    if res.session:
        return {
            "access_token": res.session.access_token,
            "user_id": res.user.id
        }

    raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/logout")
def logout():
    logout_user()
    return {"message": "Logged out"}