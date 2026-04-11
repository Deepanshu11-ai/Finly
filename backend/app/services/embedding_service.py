import requests
import os

JINA_API_KEY = os.getenv("JINA_API_KEY")

def get_embeddings(texts):

    response = requests.post(
        "https://api.jina.ai/v1/embeddings",
        headers={
            "Authorization": f"Bearer {JINA_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "input": texts,
            "model": "jina-embeddings-v2-base-en"
        }
    )

    data = response.json()

    if "data" not in data:
        raise Exception(data)

    return [item["embedding"] for item in data["data"]]


def get_embedding(text):
    return get_embeddings([text])[0]