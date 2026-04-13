#!/usr/bin/env python3
"""
Test script to verify policy ID generation works correctly
"""

import os
import sys

def test_policy_id_generation():
    """Test the new policy ID generation logic"""
    
    print("=" * 60)
    print("TESTING POLICY ID GENERATION")
    print("=" * 60)
    
    # Simulate the new logic
    base_path = "vector_db"
    os.makedirs(base_path, exist_ok=True)
    
    # Get existing policies
    existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
    
    print(f"\n📂 Found {len(existing)} existing policy directories:")
    print(f"   {sorted(existing, key=lambda x: int(x.split('_')[1]))}\n")
    
    # OLD LOGIC (WRONG - counts length)
    print("❌ OLD LOGIC (incorrect):")
    old_id = len(existing) + 1
    print(f"   new_id = len(existing) + 1")
    print(f"   new_id = {len(existing)} + 1 = {old_id}")
    print(f"   Problem: Doesn't account for gaps (e.g., missing policy_10, policy_13)")
    
    # NEW LOGIC (CORRECT - finds max ID)
    print("\n✅ NEW LOGIC (correct):")
    if existing:
        policy_ids = []
        for d in existing:
            try:
                policy_num = int(d.split("_")[1])
                policy_ids.append(policy_num)
            except (IndexError, ValueError):
                continue
        new_id = max(policy_ids) + 1 if policy_ids else 1
        print(f"   Extract numeric IDs: {sorted(policy_ids)}")
        print(f"   Find max: {max(policy_ids)}")
        print(f"   new_id = {max(policy_ids)} + 1 = {new_id}")
    else:
        new_id = 1
        print(f"   No existing policies")
        print(f"   new_id = 1")
    
    print(f"\n🎯 Result:")
    print(f"   Next policy should be created as: policy_{new_id}/")
    print(f"\n✅ Test complete!")
    
    return new_id

if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__) or ".")
    next_id = test_policy_id_generation()
    
    print("\n" + "=" * 60)
    print(f"NEXT UPLOAD WILL CREATE: policy_{next_id}/")
    print("=" * 60)
