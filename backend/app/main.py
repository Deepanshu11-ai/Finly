from fastapi import FastAPI
from app.routes import upload, documents, auth, chat

app = FastAPI(title="Insurance RAG API")

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(documents.router)
app.include_router(chat.router)
from app.routes import simulator

app.include_router(simulator.router)

@app.get("/")
def home():
    return {"message": "API running 🚀"}

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)