import json
from multiprocessing import context
import re

from services.embedding_service import get_embedding
from services.supabase_client import supabase
from services.llm_service import llm


# ---------------- CLEAN JSON ----------------
def clean_json(text):
    """Clean and fix malformed JSON from LLM responses"""
    if not text:
        return "{}"
    
    # Remove markdown code blocks
    text = re.sub(r"```json|```", "", text).strip()
    
    # Remove leading/trailing backticks and quotes
    text = text.strip('`\'" \n')
    
    # Try to find JSON content between { and }
    start = text.find('{')
    end = text.rfind('}')
    
    if start == -1 or end == -1 or end <= start:
        # No valid JSON structure found
        return "{}"
    
    text = text[start:end+1]
    
    # Fix common JSON issues
    # 1. Replace single quotes with double quotes for JSON keys/values
    # Be careful not to replace quotes inside strings
    text = re.sub(r":\s*'([^']*)'", r': "\1"', text)
    text = re.sub(r"'([^']*)':", r'"\1":', text)
    
    # 2. Remove control characters and fix newlines inside strings
    text = text.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
    
    # 3. Fix trailing commas before closing braces/brackets
    text = re.sub(r',(\s*[}\]])', r'\1', text)
    
    # 4. Fix missing quotes around values that look like they should be strings
    # This is tricky - only do it for obviously unquoted strings
    
    # 5. Escape any unescaped quotes within string values
    # This is complex, so we'll use a different approach - force valid JSON
    try:
        # Try to parse - if it fails, we might have unfixed issues
        json.loads(text)
        return text
    except json.JSONDecodeError:
        # Try removing problematic characters
        text = re.sub(r'[\x00-\x1f]', ' ', text)
        
        # Try again
        try:
            json.loads(text)
            return text
        except:
            # Return empty JSON if we can't fix it
            return "{}"


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
            "covered": [],
            "not_covered": [],
            "conditions": []
        }

    context = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
You are an insurance analyst.

Extract structured policy details.

Return STRICT JSON:

{{
  "covered": [
    {{
      "text": "short coverage point",
      "evidence": "exact sentence from context"
    }}
  ],
  "not_covered": [
    {{
      "text": "short exclusion",
      "evidence": "exact sentence from context"
    }}
  ],
  "conditions": [
    {{
      "text": "rule or condition",
      "evidence": "exact sentence from context"
    }}
  ]
}}

RULES:
- Use ONLY context
- Keep points short and meaningful
- Prefer real coverage/exclusions over generic text
- Evidence must be copied from context

Context:
{context}
"""

    try:
        response = llm.invoke(prompt)
        content = clean_json(response.content)
        data = json.loads(content)

        # 🔥 softer validation (IMPORTANT CHANGE)
        def filter_items(items):
            result = []
            if not items or not isinstance(items, list):
                return result
                
            for i in items:
                if not isinstance(i, dict):
                    continue
                    
                text = str(i.get("text", "")).strip()
                evidence = str(i.get("evidence", "")).strip()

                if text and evidence and len(evidence) > 20:
                    result.append({
                        "text": text[:500],  # Truncate long text
                        "evidence": evidence[:1000]  # Truncate long evidence
                    })
            return result

        return {
            "covered": filter_items(data.get("covered", [])),
            "not_covered": filter_items(data.get("not_covered", [])),
            "conditions": filter_items(data.get("conditions", []))
        }

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {e}")
        print(f"Attempted to parse:\n{content[:500] if content else 'EMPTY'}")
        return {
            "covered": [],
            "not_covered": [{"text": "Unable to parse policy", "evidence": "JSON parsing failed"}],
            "conditions": []
        }
    except Exception as e:
        print(f"❌ Policy Summary Error: {e}")
        return {
            "covered": [],
            "not_covered": [{"text": "Unable to generate summary", "evidence": str(e)[:200]}],
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
        data = json.loads(content)
        
        # Validate response has required fields
        if "status" not in data:
            data["status"] = "Error"
        if "reason" not in data:
            data["reason"] = "Unable to determine"
        if "confidence" not in data:
            data["confidence"] = "0%"
            
        return {
            "status": str(data.get("status", "Error"))[:50],
            "reason": str(data.get("reason", "Unable to determine"))[:500],
            "confidence": str(data.get("confidence", "0%"))[:20]
        }

    except json.JSONDecodeError as e:
        print(f"Query JSON Parse Error: {e}")
        return {
            "status": "Error",
            "reason": "Could not parse response",
            "confidence": "0%"
        }
    except Exception as e:
        print(f"Query Generation Error: {e}")
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
    

def detect_hidden_clauses(chunks):
    context = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
You are a strict insurance auditor.

ONLY extract clauses that are EXPLICITLY present in the context.

Return STRICT JSON:

{{
  "risks": [
    {{
      "clause": "exact clause text (copy from context)",
      "impact": "Low / Medium / High",
      "explanation": "why risky",
      "financial_impact": "real world impact",
      "evidence": "exact sentence from context"
    }}
  ]
}}

RULES:
- DO NOT guess or assume anything
- DO NOT add common insurance clauses
- ONLY use what is clearly written in context
- ALWAYS include evidence
- If not found → return empty list

Context:
{context}
"""

    try:
        response = llm.invoke(prompt)
        content = clean_json(response.content)
        data = json.loads(content)
        

        # 🔥 ADD THIS PART (FINANCIAL IMPACT ENGINE)
        def estimate_impact(clause_text):
            clause_text = clause_text.lower()

            if "co-pay" in clause_text or "copay" in clause_text:
                return "You may need to pay 10–30% of your hospital bill from your pocket"

            if "room rent" in clause_text or "entitlement" in clause_text:
                return "Hospital bill may be reduced proportionally, leading to 20–50% loss"

            if "waiting period" in clause_text:
                return "Claim may be rejected entirely if within waiting period"

            if "submission" in clause_text:
                return "Late submission may result in full claim rejection"

            return "May reduce your final claim amount"

        # 🔥 APPLY IT
        for r in data.get("risks", []):
            r["financial_impact"] = estimate_impact(r.get("clause", ""))

        return data

    except json.JSONDecodeError as e:
        print(f"❌ Hidden Clauses JSON Error: {e}")
        print(f"Attempted to parse:\n{content[:300] if content else 'EMPTY'}")
        return {"risks": []}
    except Exception as e:
        print(f"❌ Hidden Clauses Error: {e}")
        return {
            "risks": [],
            "error": str(e)[:200]
        }

    try:
        response = llm.invoke(prompt)
        content = clean_json(response.content)
        return json.loads(content)
    except:
        return {"risks": []}