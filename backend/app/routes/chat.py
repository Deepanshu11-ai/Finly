from fastapi import APIRouter, Depends, Form
from app.core.auth import get_current_user
from app.services.query_service import retrieve_chunks
from app.services.llm_service import generate_answer

router = APIRouter(tags=["chat"])


@router.post("/chat")
def chat(question: str = Form(...), user_id: str = Depends(get_current_user)):

    chunks = retrieve_chunks(question, user_id)

    if not chunks:
        return {"answer": "No relevant info found"}

    answer = generate_answer(question, chunks)

    return {
        "answer": answer,
        "sources": chunks
    }