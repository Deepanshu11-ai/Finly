from fastapi import APIRouter, UploadFile, Depends
from app.services.storage_service import upload_file
from app.services.document_service import save_document
from app.core.auth import get_current_user

router = APIRouter(tags=["upload"])


@router.post("/upload")
async def upload(file: UploadFile, user_id: str = Depends(get_current_user)):

    file_url = await upload_file(file)

    save_document(user_id, file.filename, file_url)

    return {"message": "uploaded successfully"}