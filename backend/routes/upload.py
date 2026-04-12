from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from utils.auth import get_current_user

from services.pdf_service import extract_text_from_pdf
from services.chunking_service import chunk_text
from services.embedding_service import get_embedding
from services.query_service import generate_policy_summary, detect_hidden_clauses
from services.supabase_client import supabase
from services.scoring_service import calculate_policy_score

import uuid

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user)
):
    try:
        # ---------------- READ FILE ----------------
        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty file")

        # ---------------- STORE FILE ----------------
        file_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = f"{user_id}/{file_name}"

        try:
            supabase.storage.from_("policies").upload(
                path=file_path,
                file=file_bytes,
                file_options={"content-type": file.content_type}
            )
        except Exception as e:
            print("Storage upload warning:", e)

        # ---------------- EXTRACT TEXT ----------------
        text = extract_text_from_pdf(file_bytes)

        if not text or len(text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # ---------------- ⚡ FAST SUMMARY ----------------
        summary = generate_policy_summary([
            {"content": text[:10000]}   # more context = better accuracy
        ])

        # ---------------- 🔍 HIDDEN CLAUSES ----------------
        hidden_clauses = detect_hidden_clauses([
            {"content": text[:12000]}   # slightly more context for risks
        ])

        # ---------------- 🧠 POLICY SCORE ----------------
        # convert summary to simple lists for scoring
        simple_summary = {
            "covered": [i["text"] for i in summary.get("covered", [])],
            "not_covered": [i["text"] for i in summary.get("not_covered", [])],
            "conditions": [i["text"] for i in summary.get("conditions", [])]
        }

        score = calculate_policy_score(simple_summary, hidden_clauses)

        # ---------------- 🔄 EMBEDDINGS (BACKGROUND STORAGE) ----------------
        chunks = chunk_text(text)[:20]

        for chunk in chunks:
            try:
                embedding = get_embedding(chunk)

                supabase.table("chunks").insert({
                    "user_id": user_id,
                    "content": chunk,
                    "embedding": embedding
                }).execute()

            except Exception as e:
                print("Embedding error:", e)

        # ---------------- RESPONSE ----------------
        return {
            "message": "Uploaded successfully",
            "analysis": summary,
            "risks": hidden_clauses,
            "score": score
        }

    except Exception as e:
        print("UPLOAD ERROR:", e)

        return {
            "message": "Upload failed",
            "analysis": {
                "covered": [],
                "not_covered": [{"text": "Analysis failed", "evidence": str(e)[:200]}],
                "conditions": []
            },
            "risks": {"risks": []},
            "score": {
                "score": 0,
                "label": "Error",
                "reasons": [str(e)]
            },
            "error": str(e)[:200]
        }