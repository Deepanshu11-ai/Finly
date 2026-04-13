from django.shortcuts import render

# Create your views here.
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

from django.http import JsonResponse

from core.services.compare import compare_policies
from core.services.hidden import detect_hidden_clauses
from .services.rag import process_pdf
from django.shortcuts import render

def home(request):
    return render(request, "index.html")


from core.services.rag import process_pdf

import os

@api_view(['POST'])
def upload_policy(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "file required"}, status=400)

    # 🔥 AUTO GENERATE POLICY ID
    base_path = "vector_db"
    os.makedirs(base_path, exist_ok=True)

    existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]

    new_id = len(existing) + 1

    # Save file
    file_path = os.path.join("media", file.name)
    os.makedirs("media", exist_ok=True)

    with open(file_path, 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    # Process
    process_pdf(file_path, new_id)

    return Response({
        "message": "uploaded successfully",
        "policy_id": new_id
    })
from .services.rag import ask_question

@api_view(['POST'])
def ask(request):
    query = request.data.get('query')
    policy_id = request.data.get('policy_id', 1)

    if not query:
        return Response({"error": "No query provided"}, status=400)

    answer = ask_question(query, policy_id)

    return Response({
        "query": query,
        "answer": answer
    })

from .services.coverage import get_coverage

import json

@api_view(['GET'])
def coverage(request):
    import json

    policy_id = request.GET.get("policy_id", 1)

    try:
        raw = get_coverage(policy_id)

        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)

        return Response(parsed)

    except Exception as e:
        return Response({
            "error": str(e)
        })
from .services.simulator import simulate_scenario
import json

@api_view(['POST'])
def simulate(request):
    import json
    from core.services.simulator import simulate_scenario

    scenario = request.data.get("scenario")
    policy_id = request.data.get("policy_id", 1)

    raw = simulate_scenario(scenario, policy_id)

    try:
        # 🔥 CLEAN RESPONSE
        if isinstance(raw, dict):
            return Response(raw)

        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)

        return Response(parsed)

    except:
        return Response({
            "decision": "Unknown",
            "reason": raw,
            "risk_level": "Medium"
        })
from .services.scoring import score_policy
@api_view(['GET'])
def policy_score(request):
    import json
    from core.services.scoring import score_policy

    policy_id = request.GET.get("policy_id", 1)

    raw = score_policy(policy_id)

    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)

        return Response(parsed)

    except:
        return Response({
            "score": 50,
            "summary": raw,
            "pros": [],
            "cons": []
        })
@api_view(['POST'])
def compare(request):
    import json
    from core.services.compare import compare_policies

    p1 = request.data.get("policy_1")
    p2 = request.data.get("policy_2")

    raw = compare_policies(p1, p2)

    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(cleaned)

        return Response(parsed)

    except:
        return Response({
            "better_policy": "Unknown",
            "verdict": raw,
            "differences": []
        })
from core.services.hidden import detect_hidden_clauses

@api_view(['GET'])
def hidden_clauses(request):
    import json
    from core.services.hidden import detect_hidden_clauses

    policy_id = request.GET.get("policy_id", 1)

    raw = detect_hidden_clauses(policy_id)

    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return Response(json.loads(cleaned))
    except:
        return Response({
            "hidden_clauses": [],
            "risk_summary": raw,
            "severity": "Low"
        })

from django.shortcuts import render

def compare_page(request):
    return render(request, "compare.html")

from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from core.services.coverage import get_coverage


@api_view(['GET'])
def coverage(request):
    import json
    from core.services.coverage import get_coverage

    policy_id = request.GET.get("policy_id", 1)

    raw = get_coverage(policy_id)

    try:
        cleaned = raw.replace("```json", "").replace("```", "").strip()
        return Response(json.loads(cleaned))
    except:
        return Response({
            "covered": [],
            "not_covered": [],
            "conditions": [],
            "raw": raw
        })
@api_view(['POST'])
def claim_predict(request):
    import json
    from core.services.coverage import get_coverage
    from core.ml.predictor import predict_claim, explain_factors
    from core.services.claim_llm import generate_explanation
    from core.services.feature_extractor import extract_features

    scenario = request.data.get("scenario")
    policy_id = request.data.get("policy_id", 1)

    # 🔥 STEP 1 — LLM feature extraction
    features = extract_features(scenario)

    claim_type = features["claim_type"]
    waiting_period = features["waiting_period"]
    covered = features["covered"]

    # 🔥 STEP 2 — coverage-based features
    raw = get_coverage(policy_id)
    cleaned = raw.replace("```json", "").replace("```", "").strip()
    data = json.loads(cleaned)

    exclusions = len(data.get("not_covered", []))
    conditions = len(data.get("conditions", []))

    # 🔥 STEP 3 — ML prediction
    probability, decision = predict_claim(
        exclusions,
        conditions,
        covered,
        waiting_period,
        claim_type
    )

    factors = explain_factors(exclusions, conditions, covered, waiting_period)

    # 🔥 STEP 4 — LLM explanation
    explanation = generate_explanation(
        scenario,
        probability,
        decision,
        factors
    )

    return Response({
        "approval_probability": probability,
        "decision": decision,
        "factors": factors,
        "explanation": explanation,
        "extracted_features": features  # 👈 nice for demo
    })