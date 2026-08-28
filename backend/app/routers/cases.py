from fastapi import APIRouter, HTTPException
from app.db import get_cursor
from app.rag.retrieval import similar_cases

router = APIRouter(prefix="/api/cases", tags=["cases"])


@router.get("")
def list_cases(limit: int = 50, offset: int = 0):
    with get_cursor() as cur:
        cur.execute("""
            SELECT case_id, case_title, citation, court, judgment_date, case_type, source_url
            FROM cases ORDER BY judgment_date DESC NULLS LAST LIMIT %s OFFSET %s
        """, (limit, offset))
        return cur.fetchall()


@router.get("/{case_id}")
def get_case(case_id: str):
    with get_cursor() as cur:
        cur.execute("SELECT * FROM cases WHERE case_id = %s", (case_id,))
        case = cur.fetchone()
        if not case:
            raise HTTPException(404, "Case not found")

        cur.execute("""
            SELECT j.full_name, cb.role FROM case_bench cb
            JOIN judges j ON j.judge_id = cb.judge_id WHERE cb.case_id = %s
        """, (case_id,))
        case["bench"] = cur.fetchall()

        cur.execute("""
            SELECT l.act_name, ls.section_number FROM case_legal_sections cls
            JOIN legal_sections ls ON ls.section_id = cls.section_id
            JOIN laws l ON l.law_id = ls.law_id WHERE cls.case_id = %s
        """, (case_id,))
        case["legal_sections"] = cur.fetchall()

        cur.execute("SELECT keyword, source FROM case_keywords WHERE case_id = %s", (case_id,))
        case["keywords"] = cur.fetchall()

        cur.execute("""
            SELECT cited_case_id, cited_case_text, treatment FROM case_citations WHERE citing_case_id = %s
        """, (case_id,))
        case["cites"] = cur.fetchall()

        cur.execute("""
            SELECT citing_case_id, treatment FROM case_citations WHERE cited_case_id = %s
        """, (case_id,))
        case["cited_by"] = cur.fetchall()

        cur.execute("""
            SELECT annotation_type, content, confidence_score, model_name, human_verified, generated_at
            FROM case_ai_annotations WHERE case_id = %s
        """, (case_id,))
        case["ai_annotations"] = cur.fetchall()  # clearly separate from the extracted fields above

        return case


@router.get("/{case_id}/similar")
def get_similar_cases(case_id: str, top_k: int = 5):
    return similar_cases(case_id, top_k=top_k)
