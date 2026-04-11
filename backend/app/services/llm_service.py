import requests
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


def generate_answer(question, chunks):

    context = "\n\n".join([c["content"][:300] for c in chunks])

    prompt = f"""
Answer the question using the context.

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

    if "choices" not in data:
        return "Error generating response"

    return data["choices"][0]["message"]["content"]