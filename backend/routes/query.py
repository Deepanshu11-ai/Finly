from fastapi import APIRouter, Depends
from pydantic import BaseModel
from utils.auth import get_current_user
from services.query_service import retrieve_chunks, generate_query_answer

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/query")
def query(data: QueryRequest, user_id: str = Depends(get_current_user)):
    """Answer questions about the policy"""
    try:
        chunks = retrieve_chunks(data.query, user_id)
        
        result = generate_query_answer(data.query, chunks)
        
        return result
    except Exception as e:
        return {
            "status": "Error",
            "reason": str(e),
            "confidence": "0%"
        }


@router.post("/simulate")
def simulate(data: dict, user_id: str = Depends(get_current_user)):
    query_text = data.get("query")

    chunks = retrieve_chunks(query_text, user_id)

    result = generate_query_answer(query_text, chunks)

    return result

from services.query_service import detect_hidden_clauses
@router.get("/hidden-clauses")
def hidden_clauses(user_id: str = Depends(get_current_user)):
    chunks = retrieve_chunks(
        "limits sublimit co-pay deduction waiting period conditions",
        user_id,
        limit=15
    )

    result = detect_hidden_clauses(chunks)

    return result