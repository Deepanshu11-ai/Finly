# Code Changes - Before & After

## Change 1: views.py - upload_policy() function

### ❌ BEFORE (Problematic)
```python
@api_view(['POST'])
def upload_policy(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "file required"}, status=400)

    base_path = "vector_db"
    os.makedirs(base_path, exist_ok=True)

    existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
    new_id = len(existing) + 1

    file_path = os.path.join("media", file.name)
    os.makedirs("media", exist_ok=True)

    with open(file_path, 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    # 🔴 NO ERROR HANDLING HERE!
    process_pdf(file_path, new_id)

    # 🔴 ALWAYS RETURNS SUCCESS EVEN IF PDF PROCESSING FAILED
    return Response({
        "message": "uploaded successfully",
        "policy_id": new_id
    })
```

### ✅ AFTER (Fixed)
```python
@api_view(['POST'])
def upload_policy(request):
    file = request.FILES.get('file')

    if not file:
        return Response({"error": "file required"}, status=400)

    base_path = "vector_db"
    os.makedirs(base_path, exist_ok=True)

    existing = [d for d in os.listdir(base_path) if d.startswith("policy_")]
    new_id = len(existing) + 1

    file_path = os.path.join("media", file.name)
    os.makedirs("media", exist_ok=True)

    with open(file_path, 'wb+') as f:
        for chunk in file.chunks():
            f.write(chunk)

    # 🟢 PROPER ERROR HANDLING
    try:
        chunks_count = process_pdf(file_path, new_id)
        return Response({
            "message": "uploaded successfully",
            "policy_id": new_id,
            "chunks": chunks_count  # Bonus: return chunk count
        })
    except Exception as e:
        # 🟢 CATCH AND REPORT ERRORS
        print(f"❌ Error processing PDF for policy {new_id}: {str(e)}")
        return Response({
            "error": f"Failed to process PDF: {str(e)}",
            "policy_id": new_id
        }, status=400)  # Return error status code
```

**Key Improvements:**
- ✅ Catches errors from `process_pdf()`
- ✅ Returns proper error status code (400)
- ✅ Includes error details in response
- ✅ Logs error to server console
- ✅ Returns chunk count for verification

---

## Change 2: rag.py - process_pdf() function

### ❌ BEFORE (Minimal Logging)
```python
def process_pdf(file_path, policy_id):
    db_path = os.path.join(BASE_DB_PATH, f"policy_{policy_id}")
    os.makedirs(db_path, exist_ok=True)

    loader = PyPDFLoader(file_path)
    documents = loader.load()

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )

    chunks = splitter.split_documents(documents)

    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2"
    )

    db = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=db_path
    )

    db.persist()

    print(f"✅ DB created at {db_path}")

    return len(chunks)
```

### ✅ AFTER (Enhanced Logging & Error Handling)
```python
def process_pdf(file_path, policy_id):
    """
    Process a PDF file and create a ChromaDB vector database.
    
    Args:
        file_path: Path to the PDF file
        policy_id: ID to assign to the policy
        
    Returns:
        Number of chunks created
        
    Raises:
        Exception: If PDF processing fails at any step
    """
    try:
        db_path = os.path.join(BASE_DB_PATH, f"policy_{policy_id}")
        os.makedirs(db_path, exist_ok=True)
        print(f"📂 Created directory: {db_path}")

        print(f"📄 Loading PDF: {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        print(f"✅ Loaded {len(documents)} pages from PDF")

        print(f"🔄 Splitting documents into chunks...")
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100
        )
        chunks = splitter.split_documents(documents)
        print(f"✅ Created {len(chunks)} chunks")

        print(f"🧠 Generating embeddings...")
        embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2"
        )

        print(f"💾 Creating ChromaDB vector store...")
        db = Chroma.from_documents(
            documents=chunks,
            embedding=embeddings,
            persist_directory=db_path
        )

        print(f"💾 Persisting database...")
        db.persist()

        print(f"✅ DB created at {db_path}")
        return len(chunks)
        
    except Exception as e:
        # 🟢 PROPER ERROR HANDLING
        print(f"❌ Error processing PDF: {str(e)}")
        import traceback
        traceback.print_exc()  # Full stack trace for debugging
        raise  # Re-raise so caller can handle
```

**Key Improvements:**
- ✅ Added docstring
- ✅ Logs at each major step
- ✅ Shows page count after loading
- ✅ Shows chunk count after splitting
- ✅ Catches and logs all exceptions
- ✅ Prints full traceback for debugging
- ✅ Re-raises exception so caller knows it failed

---

## Impact & Benefits

| Issue | Before | After |
|-------|--------|-------|
| Upload fails silently | ❌ Yes | ✅ No |
| User sees error | ❌ No | ✅ Yes |
| Server logs error | ❌ No | ✅ Yes |
| Easy to debug | ❌ No | ✅ Yes |
| Returns chunk count | ❌ No | ✅ Yes |
| HTTP status code | ❌ Always 200 | ✅ 200 or 400 |

---

## Testing the Fix

### Test 1: Successful Upload
**Expected:** Server logs show complete processing, no errors
```
📂 Created directory: vector_db/policy_15
📄 Loading PDF: media/sample.pdf
✅ Loaded 25 pages from PDF
🔄 Splitting documents into chunks...
✅ Created 120 chunks
🧠 Generating embeddings...
💾 Creating ChromaDB vector store...
💾 Persisting database...
✅ DB created at vector_db/policy_15
```

**Frontend:** Shows "Uploaded Policy ID: 15"

### Test 2: Failed Upload (e.g., corrupted PDF)
**Expected:** Server logs show error message and traceback
```
📂 Created directory: vector_db/policy_16
📄 Loading PDF: media/bad.pdf
❌ Error processing PDF: PDF file is damaged...
Traceback (most recent call last):
  ...
```

**Frontend:** Shows error: "Failed to process PDF: PDF file is damaged..."

---

## Files Modified
- `core/views.py` - Lines 23-57 (upload_policy function)
- `core/services/rag.py` - Lines 14-67 (process_pdf function)
