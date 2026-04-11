from fastapi import APIRouter, UploadFile, Depends, HTTPException
from app.core.auth import get_current_user
from app.core.supabase_client import supabase
from app.utils.file_parser import extract_text
from app.utils.chunking import chunk_text
from app.services.embedding_service import get_embeddings
import uuid

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload(file: UploadFile, user_id: str = Depends(get_current_user)):
    """Upload and process a policy document (requires authentication)"""
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        # Validate file size (limit to 25MB)
        file_bytes = await file.read()
        if len(file_bytes) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 25MB)")
        
        # Validate file type
        valid_extensions = {'.pdf', '.txt', '.doc', '.docx'}
        file_ext = '.' + file.filename.split('.')[-1].lower()
        if file_ext not in valid_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Supported: {', '.join(valid_extensions)}"
            )

        unique_name = f"{uuid.uuid4()}_{file.filename}"

        # Upload file to storage
        supabase.storage.from_("documents").upload(unique_name, file_bytes)
        file_url = supabase.storage.from_("documents").get_public_url(unique_name)

        # Save document metadata
        doc = supabase.table("documents").insert({
            "user_id": user_id,
            "file_name": file.filename,
            "file_url": file_url
        }).execute()

        document_id = doc.data[0]["id"]

        # Extract text from file
        text = extract_text(file_bytes)

        if len(text) < 100:
            raise HTTPException(
                status_code=400, 
                detail="File has insufficient text content (minimum 100 characters required)"
            )

        # Split into chunks
        chunks = chunk_text(text)

        # Generate embeddings
        embeddings = get_embeddings(chunks)

        # Batch insert embeddings
        data = []
        for chunk, embedding in zip(chunks, embeddings):
            data.append({
                "user_id": user_id,
                "document_id": document_id,
                "content": chunk,
                "embedding": embedding
            })

        supabase.table("embeddings").insert(data).execute()

        return {
            "message": f"✅ Document '{file.filename}' uploaded and processed successfully! ({len(chunks)} chunks)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing document: {str(e)}"
        )