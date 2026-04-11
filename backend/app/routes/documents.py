from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.core.supabase_client import supabase

router = APIRouter(tags=["documents"])


@router.get("/documents")
def get_documents(user_id: str = Depends(get_current_user)):

    response = supabase.table("documents") \
        .select("*") \
        .eq("user_id", user_id) \
        .execute()

    return response.data