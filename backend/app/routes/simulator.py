from fastapi import APIRouter, Depends, Form
from app.core.auth import get_current_user
from app.services.query_service import retrieve_chunks
from app.services.llm_service import generate_simulation

router = APIRouter(tags=["simulator"])


@router.post("/simulate")
def simulate(question: str = Form(...), user_id: str = Depends(get_current_user)):

    chunks = retrieve_chunks(question, user_id)

    if not chunks:
        return {"result": "No relevant policy info found"}

    result = generate_simulation(question, chunks)

    return {
        "result": result,
        "sources": chunks
    }