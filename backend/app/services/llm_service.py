import requests
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def generate_answer(question, chunks):

    context = "\n\n".join([c["content"] for c in chunks])

    prompt = f"""
You are an insurance expert.

Answer ONLY using the context below.
If not found, say "Not mentioned in policy".

Context:
{context}

Question:
{question}
"""

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    data = response.json()

    # 🔥 DEBUG PRINT (very important)
    print("Groq response:", data)

    # ❌ Handle error safely
    if "choices" not in data:
        raise Exception(f"Groq API Error: {data}")

    return data["choices"][0]["message"]["content"]