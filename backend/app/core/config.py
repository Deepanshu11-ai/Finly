import os
from dotenv import load_dotenv

load_dotenv()  # MUST be before getenv

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("DEBUG URL:", SUPABASE_URL)  # temporary