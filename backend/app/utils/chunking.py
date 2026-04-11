def chunk_text(text, chunk_size=800, overlap=100):
    chunks = []
    start = 0

    while start < len(text):
        chunks.append(text[start:start + chunk_size])
        start += chunk_size - overlap

    return chunks[:15]  # 🔥 LIMIT