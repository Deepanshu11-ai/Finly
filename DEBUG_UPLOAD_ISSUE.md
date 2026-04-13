# Upload Issue Debug Guide

## Problem Summary
The upload endpoint returns "uploaded successfully" but no new vector database is created. The message says "DB created" in logs but directories remain empty or missing.

## Root Cause
The `upload_policy()` function in `views.py` was **not catching errors** from `process_pdf()`. If the PDF processing failed at any step, the error was silent and the endpoint still returned success.

## Fixes Applied

### 1. ✅ Enhanced Error Handling in `views.py`
**Before:** No try-catch around `process_pdf()`
```python
process_pdf(file_path, new_id)  # Could fail silently!
return Response({"message": "uploaded successfully", "policy_id": new_id})
```

**After:** Proper error handling with informative messages
```python
try:
    chunks_count = process_pdf(file_path, new_id)
    return Response({
        "message": "uploaded successfully",
        "policy_id": new_id,
        "chunks": chunks_count
    })
except Exception as e:
    print(f"❌ Error processing PDF for policy {new_id}: {str(e)}")
    return Response({
        "error": f"Failed to process PDF: {str(e)}",
        "policy_id": new_id
    }, status=400)
```

### 2. ✅ Improved Debug Logging in `rag.py`
**Enhanced the `process_pdf()` function with detailed logging:**
- Logs when directory is created
- Logs when PDF is loaded (and page count)
- Logs when chunks are created (and chunk count)
- Logs when embeddings are generated
- Logs when ChromaDB is created and persisted
- Full exception traceback on failure

## How to Debug Further

### Check Server Logs
When you upload a file, watch the Django server console for detailed logs:
```
📂 Created directory: vector_db/policy_15
📄 Loading PDF: media/filename.pdf
✅ Loaded 25 pages from PDF
🔄 Splitting documents into chunks...
✅ Created 120 chunks
🧠 Generating embeddings...
💾 Creating ChromaDB vector store...
💾 Persisting database...
✅ DB created at vector_db/policy_15
```

### Test Upload Manually
```bash
curl -X POST http://127.0.0.1:8000/api/upload-policy/ \
  -F "file=@path/to/your/policy.pdf"
```

Expected response on success:
```json
{
  "message": "uploaded successfully",
  "policy_id": 15,
  "chunks": 120
}
```

Expected response on error:
```json
{
  "error": "Failed to process PDF: [error details]",
  "policy_id": 15
}
```

### Verify Database Creation
After upload, check if the vector_db directory was created:
```bash
ls -la vector_db/policy_15/
```

Should contain:
- `chroma.sqlite3` (database file)
- One UUID directory with `.bin` files

## Common Issues & Solutions

### Issue 1: "Empty PDF" or "No pages"
**Cause:** PDF might be corrupted or encrypted
**Solution:** Try with a different PDF file

### Issue 2: "Embedding generation failed"
**Cause:** HuggingFace model download issue or no internet
**Solution:** Ensure internet connection, HuggingFace is accessible

### Issue 3: "Permission denied" on vector_db
**Cause:** Directory permission issues
**Solution:** Check folder permissions: `chmod 755 vector_db`

### Issue 4: Old empty folders in vector_db
**Cause:** Previous failed uploads created directories
**Solution:** Clean up: `rm -rf vector_db/policy_*` (after backing up important ones)

## Next Steps

1. **Test the upload again** with the fixed code
2. **Check server logs** for detailed error messages
3. **Verify the policy directories** are created with content
4. **Test API endpoints** to make sure they can access the database

## Files Modified
- `/Users/himanshu/Desktop/PolicyPilot/insurance_ai/core/views.py` - Added error handling
- `/Users/himanshu/Desktop/PolicyPilot/insurance_ai/core/services/rag.py` - Added detailed logging
