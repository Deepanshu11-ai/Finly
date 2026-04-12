import io
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes):
    pdf_stream = io.BytesIO(file_bytes)  # ✅ FIX

    reader = PdfReader(pdf_stream)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text