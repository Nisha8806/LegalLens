from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CORS_ORIGINS
from app.routers import cases, search

app = FastAPI(
    title="LegalLens API",
    description="Supreme Court of India case intelligence — extracted case "
                 "data + citation-verified RAG search. All AI-generated "
                 "content is served separately from extracted fields and "
                 "always links back to the original source_url.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)
app.include_router(search.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
