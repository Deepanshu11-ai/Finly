from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ since you're inside backend folder
from routes import auth, upload, documents, query

app = FastAPI(
    title="AI Insurance Backend",
    version="1.0.0"
)

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- HEALTH ----------------
@app.get("/")
def root():
    return {"message": "Backend running successfully 🚀"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ---------------- ROUTES ----------------
app.include_router(auth.router, tags=["Auth"])
app.include_router(upload.router, tags=["Upload"])
app.include_router(documents.router, tags=["Documents"])
app.include_router(query.router, tags=["Query"])