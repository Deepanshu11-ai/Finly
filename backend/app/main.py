from fastapi import FastAPI
from app.routes import upload, documents, auth

app = FastAPI(title="Insurance RAG API")

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(documents.router)


@app.get("/")
def home():
    return {"message": "API running 🚀"}