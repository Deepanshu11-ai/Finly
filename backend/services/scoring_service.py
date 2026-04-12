def calculate_policy_score(summary, risks):
    """Calculate policy quality score (0-100)"""
    try:
        score = 100
        reasons = []

        if not summary:
            summary = {"covered": [], "not_covered": [], "conditions": []}
        
        if not risks:
            risks = {"risks": []}

        # Helper to extract text from item (handles both strings and dicts)
        def get_text(item):
            if isinstance(item, str):
                return item.lower()
            elif isinstance(item, dict):
                return str(item.get("text", "")).lower()
            return ""

        # ❌ NOT COVERED PENALTY (LENIENT)
        for item in summary.get("not_covered", []):
            text = get_text(item)
            
            if not text:
                continue

            if "suicide" in text:
                score -= 12
                reasons.append("Major exclusion: suicide clause")
            elif "pre-existing" in text:
                score -= 10
                reasons.append("Pre-existing diseases excluded")
            elif "waiting period" in text:
                score -= 5
                reasons.append("Waiting period applies")
            else:
                score -= 2
                # Use full text without truncation for clarity
                clean_text = text.strip()[:200]  # Limit to 200 chars max for reasonableness
                reasons.append(f"❌ {clean_text}")

        # ⚠️ CONDITIONS PENALTY (LENIENT)
        for cond in summary.get("conditions", []):
            text = get_text(cond)
            
            if not text:
                continue

            if "co-pay" in text or "copay" in text:
                score -= 8
                reasons.append("High co-pay reduces payout")
            elif "limit" in text:
                score -= 5
                reasons.append("Coverage limits exist")
            elif "waiting" in text:
                score -= 4
                reasons.append("Waiting period condition")

        # 🔥 HIDDEN RISKS (LENIENT)
        if isinstance(risks, dict) and "risks" in risks:
            risk_list = risks.get("risks", [])
        else:
            risk_list = risks if isinstance(risks, list) else []

        for r in risk_list:
            if not isinstance(r, dict):
                continue
                
            impact = str(r.get("impact", "")).lower()

            if impact == "high":
                score -= 10
                # Prefer explanation which has full text, then clause
                reason = r.get("explanation", r.get("clause", "High risk clause"))
                reason = str(reason).strip()[:200]  # Full sentence up to 200 chars
                reasons.append(f"🔴 HIGH RISK: {reason}")
            elif impact == "medium":
                score -= 5
                reason = r.get("explanation", r.get("clause", "Medium risk clause"))
                reason = str(reason).strip()[:200]
                reasons.append(f"🟠 MEDIUM RISK: {reason}")
            elif impact == "low":
                score -= 2

        # 🟢 COVERAGE BONUS
        covered_count = len([i for i in summary.get("covered", []) if i])
        if covered_count > 5:
            score += 5
            reasons.append(f"Good coverage: {covered_count} items")

        # 🎯 FINAL CLAMP
        score = max(0, min(100, score))

        # 🧠 LABEL
        if score >= 85:
            label = "Excellent 💎"
        elif score >= 70:
            label = "Good 👍"
        elif score >= 55:
            label = "Acceptable ✓"
        elif score >= 40:
            label = "Fair ⚠️"
        else:
            label = "Risky 🚨"

        return {
            "score": score,
            "label": label,
            "reasons": reasons[:5]  # top 5 reasons only
        }
        
    except Exception as e:
        print(f"❌ Scoring Error: {e}")
        return {
            "score": 50,
            "label": "Unable to calculate",
            "reasons": [str(e)[:100]]
        }