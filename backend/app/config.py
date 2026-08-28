import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://legallens:legallens@localhost:5432/legallens")

EMBEDDING_PROVIDER = os.getenv("EMBEDDING_PROVIDER", "sentence-transformers")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
EMBEDDING_DIM = 1536 if EMBEDDING_PROVIDER == "openai" else 768

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "claude-sonnet-4-6")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
