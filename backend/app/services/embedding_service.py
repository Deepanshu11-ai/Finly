import requests
import os

JINA_API_KEY = os.getenv("JINA_API_KEY")

def get_embedding(text):
    response = requests.post(
        "https://api.jina.ai/v1/embeddings",
        headers={
            "Authorization": f"Bearer {JINA_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "input": text,
            "model": "jina-embeddings-v2-base-en"
        }
    )

    data = response.json()

    if "data" not in data:
        raise Exception(data)

    return data["data"][0]["embedding"]