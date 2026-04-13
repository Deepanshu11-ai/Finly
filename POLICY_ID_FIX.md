# Policy ID Generation Fix

## Problem
Every upload was creating **policy_14** even when uploading new policies.

**Root Cause:**
The policy ID generation logic used `len(existing)` instead of finding the maximum ID:

```python
# ❌ WRONG
existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
new_id = len(existing) + 1  # Just counts directories!
```

With 13 policy directories (policy_1-9, policy_11, policy_12, policy_14, policy_15):
- `len(existing)` = 13
- `new_id` = 13 + 1 = **14** ❌ (reuses policy_14!)

---

## Solution
Extract numeric IDs and find the maximum:

```python
# ✅ CORRECT
existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
if existing:
    policy_ids = []
    for d in existing:
        try:
            policy_num = int(d.split("_")[1])
            policy_ids.append(policy_num)
        except (IndexError, ValueError):
            continue
    new_id = max(policy_ids) + 1 if policy_ids else 1
else:
    new_id = 1
```

With the same 13 directories:
- Extract IDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15]
- `max(policy_ids)` = 15
- `new_id` = 15 + 1 = **16** ✅ (creates new policy_16!)

---

## What Changed

**File:** `core/views.py` - `upload_policy()` function (lines 23-47)

**Old Code:**
```python
existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
new_id = len(existing) + 1
```

**New Code:**
```python
# Extract numeric IDs from existing policy directories
existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
if existing:
    # Extract numbers from policy_X format and find max
    policy_ids = []
    for d in existing:
        try:
            policy_num = int(d.split("_")[1])
            policy_ids.append(policy_num)
        except (IndexError, ValueError):
            continue
    new_id = max(policy_ids) + 1 if policy_ids else 1
else:
    new_id = 1
```

---

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| Handles gaps | ❌ No | ✅ Yes |
| Always unique ID | ❌ No | ✅ Yes |
| Scales correctly | ❌ No | ✅ Yes |
| Creates new DB | ❌ No | ✅ Yes |

---

## Testing

Run the test script to verify:
```bash
python test_policy_id.py
```

Expected output:
```
NEW LOGIC (correct):
Extract numeric IDs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 14, 15]
Find max: 15
new_id = 15 + 1 = 16

NEXT UPLOAD WILL CREATE: policy_16/
```

---

## Example Scenarios

### Scenario 1: No gaps
**Existing:** policy_1, policy_2, policy_3
- Old logic: `3 + 1 = 4` ✅ Works
- New logic: `max(1,2,3) + 1 = 4` ✅ Works

### Scenario 2: With gaps
**Existing:** policy_1, policy_3, policy_5
- Old logic: `3 + 1 = 4` ❌ Creates policy_4 (but should be 6)
- New logic: `max(1,3,5) + 1 = 6` ✅ Correct!

### Scenario 3: With large numbers
**Existing:** policy_1, policy_100, policy_50
- Old logic: `3 + 1 = 4` ❌ Creates policy_4 (wrong!)
- New logic: `max(1,100,50) + 1 = 101` ✅ Correct!

---

## Impact

✅ **Each upload now creates a unique policy database**
✅ **No more overwriting existing policies**
✅ **Handles gaps in numbering correctly**
✅ **Scales to any number of policies**

---

## Files Modified
- `core/views.py` - Lines 23-47 (upload_policy function)

## Files Created
- `test_policy_id.py` - Test script for verification
