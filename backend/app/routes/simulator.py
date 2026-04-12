from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.auth import get_current_user

from app.services.query_service import get_all_chunks
from app.services.policy_extractor_llm import extract_policy_with_llm
from app.services.simulation_service import run_simulation
import re

router = APIRouter(tags=["simulator"])


# ✅ Request Schema
class Scenario(BaseModel):
    event: str
    event_cost: int
    income: int


class SimulationRequest(BaseModel):
    scenario: Scenario


# 🔥 FALLBACK REGEX-BASED EXTRACTION
def extract_number(num_str: str) -> int:
    """Convert string with lakh/crore to number - robust version"""
    if not num_str:
        return 0
    
    try:
        text = str(num_str).lower().strip()
        
        if not text or text == '':
            return 0
        
        # Extract base number - more aggressive
        match = re.search(r'[\d,\.]+', text)
        if not match:
            print(f"⚠️ No number found in: '{text}'")
            return 0
        
        num_text = match.group().replace(',', '')
        if not num_text or num_text == '.' or num_text == '':
            return 0
        
        # Split by decimal and take integer part
        parts = num_text.split('.')
        if not parts[0]:
            return 0
            
        num = int(parts[0])
        
        # Apply multipliers based on keywords in original text
        if 'crore' in text or 'cr ' in text:
            num *= 10000000
            print(f"  Applied 'crore' multiplier: {num}")
        elif 'lakh' in text or 'lks' in text or 'lk ' in text:
            num *= 100000
            print(f"  Applied 'lakh' multiplier: {num}")
        elif ' k' in text or text.endswith('k'):
            num *= 1000
            print(f"  Applied 'k' multiplier: {num}")
        
        return num
    except Exception as e:
        print(f"⚠️ extract_number error for '{num_str}': {str(e)}")
        return 0


def extract_policy_fallback(chunks: list[dict]) -> dict:
    """Regex-based fallback extraction - more robust for group policies"""
    text = " ".join([c["content"] for c in chunks]).lower()
    
    policy = {
        "coverage": 0,
        "deductible": 0,
        "waiting_period": 0
    }
    
    print("\n🔍 STARTING REGEX FALLBACK EXTRACTION")
    print(f"Total text length: {len(text)} chars")
    
    # 🔍 COVERAGE EXTRACTION - More flexible patterns
    coverage_patterns = [
        # Explicit keywords with optional separators and units
        r'sum insured\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore|k|rupees?|rs)?',
        r'si\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        r'coverage\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        r'benefit amount\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        r'policy benefit\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        r'maximum benefit\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        r'insured amount\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        r'policy limit\s*[:\-=]?\s*(?:₹|rs\.?\s*)?([\d,\.]+)\s*(?:lakh|crore)',
        # Currency + number patterns
        r'(?:₹|rs\.?)\s*([\d,\.]+)\s*(?:lakh|crore)',
        # Number + unit patterns (bare)
        r'([\d,\.]+)\s*(?:lakh|crore)',
    ]
    
    found_values = []
    
    for pattern in coverage_patterns:
        try:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                if not match:
                    continue
                
                # Get the number part (group 1 if exists, else group 0)
                num_part = match.group(1) if match.groups() else match.group(0)
                
                if not num_part or num_part.strip() == '':
                    continue
                
                extracted = extract_number(num_part if 'lakh' in match.group(0).lower() or 'crore' in match.group(0).lower() else match.group(0))
                
                if extracted and extracted > 50000 and extracted < 100000000:
                    found_values.append(extracted)
                    print(f"✅ Pattern match: {extracted} from '{match.group(0)[:50]}'")
                    
        except Exception as e:
            print(f"⚠️ Pattern error: {str(e)}")
            continue
    
    # If we found values, pick a reasonable one
    if found_values:
        # Remove outliers - pick median or most common
        found_values.sort()
        policy["coverage"] = found_values[len(found_values)//2]  # Pick median
        print(f"✅ Selected coverage from {len(found_values)} matches: {policy['coverage']}")
        return policy
    
    print("❌ No coverage found in regex patterns, trying bare number extraction...")
    
    # Last resort: find all numbers and pick reasonable ones
    try:
        all_numbers = re.findall(r'\d+(?:,\d+)*', text)
        if all_numbers:
            numbers = []
            for n in all_numbers:
                try:
                    num = int(n.replace(',', ''))
                    # Look for numbers in reasonable range for coverage
                    if 100000 <= num <= 100000000:  # 1 lakh to 100 crore
                        numbers.append(num)
                except:
                    pass
            
            if numbers:
                numbers.sort()
                # Pick a middle value from reasonable range
                policy["coverage"] = numbers[len(numbers)//2]
                print(f"✅ Found coverage (bare numbers): {policy['coverage']}")
                return policy
    except Exception as e:
        print(f"⚠️ Bare number extraction error: {str(e)}")
    
    print("❌ Could not extract coverage from any pattern")
    return policy


@router.post("/simulate")
def simulate(data: SimulationRequest, user_id: str = Depends(get_current_user)):
    try:
        scenario = data.scenario.dict()

        print("\n========== SIMULATION START ==========")
        print("USER ID:", user_id)

        # 🔥 STEP 1: Load FULL document (no RAG)
        chunks = get_all_chunks(user_id)

        if not chunks:
            return {"error": "No policy found. Please upload a document."}

        print(f"TOTAL CHUNKS LOADED: {len(chunks)}")

        # 🔥 HIGH PRECISION FILTERING
        important_chunks = []

        strong_keywords = [
            "sum insured",
            "coverage",
            "insured amount",
            "policy benefit",
            "benefit amount",
            "maximum benefit"
        ]

        for c in chunks:
            text = c["content"].lower()
            # must contain number + strong keyword
            if any(k in text for k in strong_keywords) and any(char.isdigit() for char in text):
                important_chunks.append(c)

        # 🔥 SECONDARY FILTER (if nothing found)
        if not important_chunks:
            print("⚠️ Using secondary filter")
            for c in chunks:
                text = c["content"].lower()
                if ("₹" in text or "lakh" in text) and any(char.isdigit() for char in text):
                    important_chunks.append(c)

        # 🔥 FINAL FALLBACK
        if not important_chunks:
            print("⚠️ Using full document (last fallback)")
            important_chunks = chunks[:50]  # limit to avoid overload

        print(f"FINAL CHUNKS SENT TO LLM: {len(important_chunks)}")

        # 🔥 STEP 3: LLM extraction
        try:
            policy = extract_policy_with_llm(important_chunks)
        except Exception as e:
            print(f"⚠️ LLM extraction error: {str(e)}")
            policy = {"coverage": 0, "deductible": 0, "waiting_period": 0}

        print("\n====== LLM POLICY ======")
        print(policy)
        print("========================\n")

        # 🔥 FALLBACK: If LLM didn't find coverage, use regex
        if not policy.get("coverage") or policy.get("coverage") == 0:
            print("⚠️ LLM extraction failed, trying regex fallback...")
            try:
                fallback_policy = extract_policy_fallback(chunks)
                if fallback_policy.get("coverage"):
                    policy = fallback_policy
                    print(f"✅ Fallback extraction succeeded: {policy}")
                else:
                    print("❌ Fallback extraction also failed")
            except Exception as e:
                print(f"⚠️ Fallback extraction error: {str(e)}")

        if not policy.get("coverage"):
            return {
                "error": "Could not extract coverage information.",
                "hint": "Your document may not contain clear numeric coverage values."
            }

        # 🔥 STEP 4: Run simulation
        try:
            result = run_simulation(policy, scenario)
        except Exception as e:
            print(f"❌ Simulation error: {str(e)}")
            return {
                "error": f"Simulation failed: {str(e)}"
            }

        return {
            "policy": policy,
            "simulation": result
        }
    
    except Exception as e:
        print(f"❌ CRITICAL ERROR in simulate(): {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "error": f"Server error: {str(e)}"
        }