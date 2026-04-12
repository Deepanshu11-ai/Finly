from langchain_groq import ChatGroq
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# ✅ Initialize ONCE globally
llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name="openai/gpt-oss-120b"
)