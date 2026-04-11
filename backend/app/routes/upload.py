from fastapi import APIRouter, UploadFile, Depends, HTTPException
from app.core.auth import get_current_user
from app.core.supabase_client import supabase
from app.utils.file_parser import extract_text
from app.utils.chunking import chunk_text
from app.services.embedding_service import get_embedding
import uuid

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload(file: UploadFile, user_id: str = Depends(get_current_user)):

    file_bytes = await file.read()

    unique_name = f"{uuid.uuid4()}_{file.filename}"

    supabase.storage.from_("documents").upload(unique_name, file_bytes)
    file_url = supabase.storage.from_("documents").get_public_url(unique_name)

    doc = supabase.table("documents").insert({
        "user_id": user_id,
        "file_name": file.filename,
        "file_url": file_url
    }).execute()

    document_id = doc.data[0]["id"]

    text = extract_text(file_bytes)
    chunks = chunk_text(text)

    for chunk in chunks:
        try:
            embedding = get_embedding(chunk)

            if isinstance(embedding, list) and isinstance(embedding[0], list):
                embedding = embedding[0]

            supabase.table("embeddings").insert({
                "user_id": user_id,
                "document_id": document_id,
                "content": chunk,
                "embedding": embedding
            }).execute()

        except Exception as e:
            print("Embedding error:", e)

    return {"message": "uploaded & processed"}