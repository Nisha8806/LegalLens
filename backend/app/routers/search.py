from fastapi import APIRouter
from pydantic import BaseModel
from app.rag import retrieval

router = APIRouter(prefix="/api/search", tags=["search"])


class SemanticQuery(BaseModel):
    query: str
    top_k: int = 8


class KeywordQuery(BaseModel):
    query: str
    top_k: int = 8


class CitationQuery(BaseModel):
    citation: str
    top_k: int = 20


class LawSectionQuery(BaseModel):
    act_name: str | None = None
    section_number: str | None = None
    top_k: int = 20


class RagQuery(BaseModel):
    question: str
    top_k: int = 6


@router.post("/semantic")
def semantic(q: SemanticQuery):
    return retrieval.semantic_search(q.query, top_k=q.top_k)


@router.post("/keyword")
def keyword(q: KeywordQuery):
    return retrieval.keyword_search(q.query, top_k=q.top_k)


@router.post("/citation")
def citation(q: CitationQuery):
    return retrieval.citation_search(q.citation, top_k=q.top_k)


@router.post("/law")
def law_section(q: LawSectionQuery):
    return retrieval.law_section_search(q.act_name, q.section_number, top_k=q.top_k)


@router.post("/query")
def rag_query(q: RagQuery):
    """
    The composite RAG endpoint: e.g. "Find Supreme Court cases dealing with
    breach of contract and identify the important legal principles."
    Returns relevant cases, passages, citations/source URLs, a confidence
    score, and an AI summary clearly labeled as such — matching askQuestion()
    in the frontend's services/api.js.
    """
    return retrieval.rag_answer(q.question, top_k=q.top_k)
