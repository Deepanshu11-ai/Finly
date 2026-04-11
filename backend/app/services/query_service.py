from app.services.embedding_service import get_embedding
from app.core.supabase_client import supabase


def retrieve_chunks(question, user_id):

    embedding = get_embedding(question)

    response = supabase.rpc("match_documents", {
        "query_embedding": embedding,
        "match_threshold": 0.2,
        "match_count": 3,
        "user_id_input": user_id
    }).execute()

    chunks = response.data

    # remove duplicates
    unique_chunks = list({c["content"]: c for c in chunks}.values())

    return unique_chunks[:3]