from app.core.supabase_client import supabase

def save_document(user_id, file_name, file_url):
    supabase.table("documents").insert({
        "user_id": user_id,
        "file_name": file_name,
        "file_url": file_url
    }).execute()