from fastapi import APIRouter, Depends
from services.supabase_client import supabase
from utils.auth import get_current_user

router = APIRouter()

@router.get("/my-documents")
def get_documents(user_id: str = Depends(get_current_user)):
    res = supabase.table("documents") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    return res.data