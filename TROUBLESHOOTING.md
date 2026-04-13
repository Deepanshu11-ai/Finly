# Troubleshooting Guide - PDF Upload Issues

## Issue: Upload says "success" but database is not created

### Root Cause
The `upload_policy()` endpoint wasn't catching errors from PDF processing. Any failure during:
- PDF loading
- Document splitting
- Embedding generation
- Database creation

...would silently fail while returning a success response.

### ✅ SOLUTION APPLIED
**Error handling added to catch and report failures** - see CODE_CHANGES.md

---

## Step-by-Step Debugging

### Step 1: Check Server Logs
When you upload a PDF, **watch the Django server console** for:

#### ✅ Success Case
```
📂 Created directory: vector_db/policy_15
📄 Loading PDF: media/myfile.pdf
✅ Loaded 25 pages from PDF
🔄 Splitting documents into chunks...
✅ Created 120 chunks
🧠 Generating embeddings...
💾 Creating ChromaDB vector store...
💾 Persisting database...
✅ DB created at vector_db/policy_15
```

#### ❌ Failure Cases
Look for error messages like:
- `❌ Error processing PDF: PDF file is not a valid PDF`
- `❌ Error processing PDF: [Errno 2] No such file or directory`
- `❌ Error processing PDF: Connection timeout (embedding generation)`

### Step 2: Verify Files Were Saved
```bash
# Check if media file was saved
ls -lh media/*.pdf

# Check if vector_db directory exists
ls -la vector_db/

# Check for the specific policy directory
ls -la vector_db/policy_15/
```

### Step 3: Check Database Contents
```bash
# Should contain chroma.sqlite3 file
ls -la vector_db/policy_15/

# Check file size (should be > 100KB for most PDFs)
du -h vector_db/policy_15/chroma.sqlite3
```

---

## Common Errors & Solutions

### Error 1: "No such file or directory"
```
❌ Error processing PDF: [Errno 2] No such file or directory: 'media/file.pdf'
```
**Cause:** File wasn't saved properly
**Solution:**
1. Check file permissions: `chmod 755 media`
2. Check disk space: `df -h`
3. Try uploading a smaller file

### Error 2: "PDF file is not a valid PDF"
```
❌ Error processing PDF: PDF file is not a valid PDF
```
**Cause:** Corrupted file or not actually a PDF
**Solution:**
1. Try with a different PDF file
2. Verify file format: `file media/yourfile.pdf`
3. Test PDF opening in a PDF reader

### Error 3: "Connection timeout" or "Connection refused"
```
❌ Error processing PDF: [Errno 111] Connection refused (embedding generation)
```
**Cause:** HuggingFace embedding model can't be downloaded
**Solution:**
1. Check internet connection
2. Check firewall settings
3. Try manually: `python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"`

### Error 4: "Permission denied"
```
❌ Error processing PDF: [Errno 13] Permission denied
```
**Cause:** Directory permission issues
**Solution:**
```bash
chmod 755 vector_db
chmod 755 media
mkdir -p vector_db media
```

### Error 5: "CUDA out of memory" or similar
```
❌ Error processing PDF: CUDA out of memory
```
**Cause:** GPU memory issues (if using GPU)
**Solution:**
1. Disable GPU: Set `CUDA_VISIBLE_DEVICES=""` environment variable
2. Or restart Django server to clear memory

### Error 6: Empty database created but no content
**Cause:** PDF loaded but has 0 pages or chunking failed
**Solution:**
1. Verify PDF is not encrypted: Try opening manually
2. Check page count in logs: Look for "Loaded X pages"
3. Try a simpler PDF for testing

---

## Verification Tests

### Test 1: Direct Python Test
```bash
cd /Users/himanshu/Desktop/PolicyPilot/insurance_ai
python test_upload.py
```

This script will:
- List all existing policy databases
- Show database file sizes
- Test retrieving context from existing policies
- Optionally test processing a new PDF

### Test 2: API Test with cURL
```bash
# Upload a test PDF
curl -X POST http://127.0.0.1:8000/api/upload-policy/ \
  -F "file=@/Users/himanshu/Desktop/PolicyPilot/sample\ pdf/h1.pdf"

# Expected success response:
# {"message":"uploaded successfully","policy_id":15,"chunks":120}

# Expected error response:
# {"error":"Failed to process PDF: ...","policy_id":15}
```

### Test 3: Frontend Test
1. Open http://127.0.0.1:3000 (React frontend) or http://127.0.0.1:8000 (Django)
2. Select a PDF file
3. Click "Upload PDF Policy"
4. Check:
   - Frontend shows success or error message
   - Look at server logs (Step 1)
   - Verify directory was created (Step 2)

### Test 4: Retrieval Test
After successful upload, test if you can query the database:
```bash
# This should return coverage information
curl "http://127.0.0.1:8000/api/coverage/?policy_id=15"
```

---

## Performance Notes

### Upload Time Expectations
- Small PDF (5-10 pages): 10-20 seconds
- Medium PDF (20-50 pages): 30-60 seconds
- Large PDF (100+ pages): 2-5 minutes

Most time is spent on **embedding generation** (🧠 step).

### Database Size
- Typical: 10-100 MB per policy (mostly embeddings)
- Depends on PDF size and embedding model

---

## Prevention Tips

### 1. Use Quality PDFs
- Ensure PDFs are:
  - Not corrupted
  - Not password-protected
  - Have text (not just images)
  - ASCII-compatible

### 2. Monitor Disk Space
```bash
# Check available space
df -h

# Check vector_db size
du -sh vector_db/
```

### 3. Clean Up Old Uploads
If you have many test uploads, clean up:
```bash
# Delete specific policy
rm -rf vector_db/policy_15

# Backup before deleting important ones
cp -r vector_db vector_db.backup
```

### 4. Monitor Server Logs
Always run the server in the foreground:
```bash
python manage.py runserver
# NOT in the background - you won't see logs
```

---

## Getting Help

If you still have issues after applying the fix:

1. **Provide server logs**: Share the console output when uploading
2. **Provide error response**: Share the exact error message from frontend
3. **Provide PDF info**: File size, page count, source
4. **Check logs first**: Most issues show clear error messages now

Files with debugging info:
- `/UPLOAD_FIX_SUMMARY.md` - Quick reference
- `/CODE_CHANGES.md` - Detailed code changes
- `/DEBUG_UPLOAD_ISSUE.md` - Technical details
- `test_upload.py` - Automated testing script
