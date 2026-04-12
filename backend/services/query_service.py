import json
import re

from services.embedding_service import get_embedding
from services.supabase_client import supabase
from services.llm_service import llm


# ---------------- CLEAN JSON ----------------
def clean_json(text):
    return re.sub(r"```json|```", "", text).strip()


# ---------------- SMART RETRIEVAL ----------------
def retrieve_chunks(query, user_id, limit=12):
    query_embedding = get_embedding(query)

    response = supabase.rpc(
        "match_chunks",
        {
            "query_embedding": str(query_embedding),
            "match_count": limit,
            "user_id": user_id
        }
    ).execute()

    chunks = response.data or []

    # 🔥 SECTION-AWARE BOOSTING
    coverage_chunks = []
    exclusion_chunks = []
    condition_chunks = []

    for c in chunks:
        text = c["content"].lower()

        if any(k in text for k in ["cover", "benefit", "hospital", "treatment"]):
            coverage_chunks.append(c)

        elif any(k in text for k in ["exclude", "not covered", "shall not"]):
            exclusion_chunks.append(c)

        elif any(k in text for k in ["condition", "waiting", "period"]):
            condition_chunks.append(c)

    # 🔥 PRIORITIZE COVERAGE FIRST
    final_chunks = (
        coverage_chunks[:5] +
        exclusion_chunks[:4] +
        condition_chunks[:3]
    )

    return final_chunks if final_chunks else chunks[:6]


# ---------------- POLICY SUMMARY ----------------
def generate_policy_summary(chunks):
    if not chunks:
        return {
            "covered": ["No data found"],
            "not_covered": ["No data found"],
            "conditions": ["No data found"]
        }

    context = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
You are an expert insurance analyst.

Extract structured policy details.

Return STRICT JSON:

{{
  "covered": ["benefits, treatments, services covered"],
  "not_covered": ["clear exclusions"],
  "conditions": ["rules, waiting periods, clauses"]
}}

IMPORTANT:
- Coverage may be scattered → infer intelligently
- NEVER leave covered empty if any benefit exists
- Ignore generic legal text
- Keep answers short bullet points

Context:
{context}
"""

    try:
        response = llm.invoke(prompt)
        content = clean_json(response.content)
        data = json.loads(content)

        return {
            "covered": data.get("covered") or ["Basic medical expenses covered"],
            "not_covered": data.get("not_covered") or [],
            "conditions": data.get("conditions") or []
        }

    except Exception as e:
        return {
            "covered": ["Error extracting coverage"],
            "not_covered": [str(e)],
            "conditions": []
        }


# ---------------- USER QUERY ----------------
def generate_query_answer(query, chunks):
    context = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
You are a professional insurance advisor.

User describes a real-world scenario.

Return JSON:

{{
  "status": "Covered / Not Covered / Conditional",
  "reason": "clear and specific explanation",
  "confidence": "0-100%"
}}

RULES:
- Be decisive
- Use context only
- If unclear → Conditional

Context:
{context}

Scenario:
{query}
"""

    try:
        response = llm.invoke(prompt)
        content = clean_json(response.content)
        return json.loads(content)

    except:
        return {
            "status": "Error",
            "reason": "Could not determine",
            "confidence": "0%"
        }
    
def simulate_scenario(query, chunks):
    context = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
You are an expert insurance claim evaluator.

A user describes a real-world situation.

Your job:
Decide if the claim is Covered, Not Covered, or Conditional.

Return STRICT JSON:

{{
  "status": "Covered / Not Covered / Conditional",
  "reason": "clear explanation based on policy",
  "conditions": "if any",
  "confidence": "0-100%"
}}

RULES:
- Consider waiting periods
- Consider exclusions
- Consider conditions
- Be decisive
- If partial → Conditional

Policy Context:
{context}

User Scenario:
{query}
"""

    try:
        response = llm.invoke(prompt)
        content = clean_json(response.content)
        return json.loads(content)

    except Exception as e:
        return {
            "status": "Error",
            "reason": str(e),
            "conditions": "",
            "confidence": "0%"
        }