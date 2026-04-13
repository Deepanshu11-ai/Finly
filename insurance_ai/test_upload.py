#!/usr/bin/env python3
"""
Test script to verify PDF upload and ChromaDB creation.
Run this from the insurance_ai directory.
"""

import os
import sys
import json
from pathlib import Path

def test_process_pdf():
    """Test the process_pdf function directly"""
    print("=" * 60)
    print("TESTING process_pdf() function")
    print("=" * 60)
    
    # Add the project to path
    sys.path.insert(0, os.path.dirname(__file__))
    
    from core.services.rag import process_pdf
    
    # Use an existing test PDF
    test_pdfs = list(Path("media").glob("*.pdf"))
    
    if not test_pdfs:
        print("❌ No PDF files found in media/ directory")
        print("   Please upload a policy PDF first")
        return False
    
    test_pdf = str(test_pdfs[0])
    test_policy_id = 999  # Use a test ID
    
    print(f"\n📄 Testing with: {test_pdf}")
    print(f"🆔 Policy ID: {test_policy_id}")
    
    try:
        chunks = process_pdf(test_pdf, test_policy_id)
        
        # Verify the directory was created
        db_path = f"vector_db/policy_{test_policy_id}"
        
        if not os.path.exists(db_path):
            print(f"❌ Database directory not created: {db_path}")
            return False
        
        if not os.path.exists(f"{db_path}/chroma.sqlite3"):
            print(f"❌ ChromaDB file not found: {db_path}/chroma.sqlite3")
            return False
        
        print(f"✅ Successfully created {chunks} chunks")
        print(f"✅ Database created at: {db_path}")
        print(f"✅ ChromaDB file size: {os.path.getsize(f'{db_path}/chroma.sqlite3')} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_existing_databases():
    """List and verify existing databases"""
    print("\n" + "=" * 60)
    print("CHECKING EXISTING DATABASES")
    print("=" * 60)
    
    vector_db_path = "vector_db"
    
    if not os.path.exists(vector_db_path):
        print("❌ vector_db directory doesn't exist")
        return
    
    policies = [d for d in os.listdir(vector_db_path) if d.startswith("policy_")]
    policies.sort(key=lambda x: int(x.split("_")[1]))
    
    print(f"\n📊 Found {len(policies)} policy databases:\n")
    
    for policy_dir in policies:
        policy_path = os.path.join(vector_db_path, policy_dir)
        policy_id = policy_dir.split("_")[1]
        
        # Check for chroma.sqlite3
        db_file = os.path.join(policy_path, "chroma.sqlite3")
        
        if os.path.exists(db_file):
            size = os.path.getsize(db_file)
            size_mb = size / (1024 * 1024)
            print(f"  ✅ policy_{policy_id:<2} | DB size: {size_mb:.2f} MB")
        else:
            print(f"  ❌ policy_{policy_id:<2} | ⚠️  Empty directory (no chroma.sqlite3)")


def test_get_context():
    """Test retrieving context from an existing database"""
    print("\n" + "=" * 60)
    print("TESTING get_context() function")
    print("=" * 60)
    
    sys.path.insert(0, os.path.dirname(__file__))
    from core.services.utils import get_context
    
    # Try with policy_1 first (most likely to exist)
    test_policies = [1, 14, 15]
    
    for policy_id in test_policies:
        print(f"\n🔍 Testing policy_{policy_id}...")
        
        context = get_context("coverage exclusions", policy_id)
        
        if context:
            print(f"✅ Retrieved context ({len(context)} chars)")
            print(f"   Sample: {context[:100]}...")
            return True
        else:
            print(f"❌ No context found for policy_{policy_id}")
    
    return False


if __name__ == "__main__":
    os.chdir(os.path.dirname(__file__) or ".")
    
    print("\n🚀 PolicyPilot Upload & Database Test Suite\n")
    
    # Test 1: Check existing databases
    test_existing_databases()
    
    # Test 2: Try to retrieve context
    test_get_context()
    
    # Test 3: Process a new PDF (if available)
    print()
    test_process_pdf()
    
    print("\n" + "=" * 60)
    print("✅ Test suite complete!")
    print("=" * 60)
