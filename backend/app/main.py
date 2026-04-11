from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import upload, chat, auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(chat.router)


@app.get("/")
def home():
    return {"message": "API running 🚀"}