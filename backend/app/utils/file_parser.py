from pypdf import PdfReader
import io

def extract_text(file_bytes):
    pdf = PdfReader(io.BytesIO(file_bytes))
    text = ""

    for page in pdf.pages:
        text += page.extract_text() or ""

    return text