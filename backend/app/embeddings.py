"""
Pluggable embedding provider so the pipeline isn't locked to one vendor.
Switch via EMBEDDING_PROVIDER in .env. Keep app.config.EMBEDDING_DIM and
sql/schema.sql's `VECTOR(1536)` column in sync with whichever model you use.
"""
from functools import lru_cache
from app.config import EMBEDDING_PROVIDER, OPENAI_API_KEY


@lru_cache(maxsize=1)
def _st_model():
    from sentence_transformers import SentenceTransformer
    # 768-dim, solid general-purpose default; swap for a legal-domain model if you have one
    return SentenceTransformer("BAAI/bge-base-en-v1.5")


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Returns one embedding vector per input text, in order."""
    if not texts:
        return []

    if EMBEDDING_PROVIDER == "openai":
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)
        resp = client.embeddings.create(model="text-embedding-3-small", input=texts)
        return [d.embedding for d in resp.data]

    elif EMBEDDING_PROVIDER == "sentence-transformers":
        model = _st_model()
        vectors = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return [v.tolist() for v in vectors]

    else:
        raise ValueError(f"Unknown EMBEDDING_PROVIDER: {EMBEDDING_PROVIDER}")


def embed_query(text: str) -> list[float]:
    return embed_texts([text])[0]
