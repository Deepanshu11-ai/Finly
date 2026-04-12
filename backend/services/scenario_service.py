def parse_scenario(query: str):
    q = query.lower()

    event = None
    conditions = []

    # 🔍 detect events
    if "theft" in q or "stolen" in q:
        event = "theft"
    elif "accident" in q or "crash" in q:
        event = "accident"
    elif "fire" in q:
        event = "fire"
    elif "flood" in q:
        event = "flood"

    # 🔍 detect conditions
    if "without license" in q:
        conditions.append("no_license")

    if "public place" in q or "outside" in q:
        conditions.append("public_location")

    if "unlocked" in q:
        conditions.append("negligence")

    return {
        "event": event,
        "conditions": conditions
    }