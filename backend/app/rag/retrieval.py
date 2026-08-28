"""
All search modes required by the brief: semantic, keyword, citation,
law/section, and case-to-case similarity — plus the composite RAG query
that assembles a labeled answer with sources and a confidence score.
"""
from app.db import get_cursor
from app.embeddings import embed_query


def semantic_search(query: str, top_k: int = 8):
    vector = embed_query(query)
    with get_cursor() as cur:
        cur.execute("""
            SELECT c.case_id, cs.case_title, cs.citation, cs.source_url, cs.document_url,
                   c.chunk_id, c.chunk_text, c.page_number, c.paragraph_number,
                   1 - (c.embedding <=> %s::vector) AS similarity
            FROM case_chunks c
            JOIN cases cs ON cs.case_id = c.case_id
            WHERE c.embedding IS NOT NULL
            ORDER BY c.embedding <=> %s::vector
            LIMIT %s
        """, (vector, vector, top_k))
        return cur.fetchall()


def keyword_search(query: str, top_k: int = 8):
    with get_cursor() as cur:
        cur.execute("""
            SELECT case_id, case_title, citation, judgment_date, source_url, document_url,
                   ts_rank(to_tsvector('english',
                       coalesce(case_title,'') || ' ' || coalesce(facts_of_case,'') || ' ' ||
                       coalesce(main_legal_issues,'') || ' ' || coalesce(final_judgment_order,'')),
                       plainto_tsquery('english', %s)) AS rank
            FROM cases
            WHERE to_tsvector('english',
                       coalesce(case_title,'') || ' ' || coalesce(facts_of_case,'') || ' ' ||
                       coalesce(main_legal_issues,'') || ' ' || coalesce(final_judgment_order,''))
                  @@ plainto_tsquery('english', %s)
            ORDER BY rank DESC
            LIMIT %s
        """, (query, query, top_k))
        return cur.fetchall()


def citation_search(citation_text: str, top_k: int = 20):
    """Find cases matching a citation string, and both directions of the
    citation graph: what a case cites, and what cites it back."""
    with get_cursor() as cur:
        cur.execute("""
            SELECT case_id, case_title, citation, neutral_citation, case_number, source_url
            FROM cases
            WHERE citation ILIKE %s OR neutral_citation ILIKE %s OR case_number ILIKE %s
            LIMIT %s
        """, (f"%{citation_text}%", f"%{citation_text}%", f"%{citation_text}%", top_k))
        matched_cases = cur.fetchall()

        results = []
        for case in matched_cases:
            cur.execute("""
                SELECT cited_case_id, cited_case_text, treatment
                FROM case_citations WHERE citing_case_id = %s
            """, (case["case_id"],))
            cites = cur.fetchall()

            cur.execute("""
                SELECT citing_case_id, treatment FROM case_citations
                WHERE cited_case_id = %s
            """, (case["case_id"],))
            cited_by = cur.fetchall()

            results.append({**case, "cites": cites, "cited_by": cited_by})
        return results


def law_section_search(act_name: str = None, section_number: str = None, top_k: int = 20):
    with get_cursor() as cur:
        cur.execute("""
            SELECT DISTINCT cs.case_id, cs.case_title, cs.citation, cs.judgment_date,
                   cs.source_url, l.act_name, ls.section_number
            FROM cases cs
            JOIN case_legal_sections cls ON cls.case_id = cs.case_id
            JOIN legal_sections ls ON ls.section_id = cls.section_id
            JOIN laws l ON l.law_id = ls.law_id
            WHERE (%s::text IS NULL OR l.act_name ILIKE %s)
              AND (%s::text IS NULL OR ls.section_number ILIKE %s)
            ORDER BY cs.judgment_date DESC NULLS LAST
            LIMIT %s
        """, (act_name, f"%{act_name}%" if act_name else None,
              section_number, f"%{section_number}%" if section_number else None, top_k))
        return cur.fetchall()


def similar_cases(case_id: str, top_k: int = 5):
    """Cached similarity if available, else compute on the fly from each
    case's centroid chunk embedding."""
    with get_cursor() as cur:
        cur.execute("""
            SELECT case_id_a, case_id_b, similarity_score FROM case_similarity
            WHERE case_id_a = %s OR case_id_b = %s
            ORDER BY similarity_score DESC LIMIT %s
        """, (case_id, case_id, top_k))
        cached = cur.fetchall()
        if cached:
            return cached

        cur.execute("""
            WITH target AS (
                SELECT AVG(embedding) AS centroid FROM case_chunks WHERE case_id = %s AND embedding IS NOT NULL
            )
            SELECT c.case_id, cs.case_title, cs.citation,
                   1 - (AVG(c.embedding) <=> (SELECT centroid FROM target)) AS similarity
            FROM case_chunks c
            JOIN cases cs ON cs.case_id = c.case_id
            WHERE c.case_id != %s AND c.embedding IS NOT NULL
            GROUP BY c.case_id, cs.case_title, cs.citation
            ORDER BY similarity DESC
            LIMIT %s
        """, (case_id, case_id, top_k))
        return cur.fetchall()


def rag_answer(question: str, top_k: int = 6):
    """
    Composite RAG query per the brief's example:
    "Find Supreme Court cases dealing with breach of contract and identify
    the important legal principles."

    Returns relevant cases, relevant passages (with page/paragraph + source
    URL), citations, and an AI-generated summary that is clearly labeled as
    such and grounded only in the retrieved passages — never invented.
    """
    passages = semantic_search(question, top_k=top_k)

    cases_seen = {}
    for p in passages:
        cases_seen.setdefault(p["case_id"], {
            "case_id": p["case_id"],
            "case_title": p["case_title"],
            "citation": p["citation"],
            "source_url": p["source_url"],
            "document_url": p["document_url"],
            "best_similarity": p["similarity"],
        })
        cases_seen[p["case_id"]]["best_similarity"] = max(
            cases_seen[p["case_id"]]["best_similarity"], p["similarity"])

    ai_summary, confidence = _synthesize_answer(question, passages)

    return {
        "question": question,
        "relevant_cases": sorted(cases_seen.values(), key=lambda c: -c["best_similarity"]),
        "relevant_passages": [
            {
                "case_id": p["case_id"],
                "case_title": p["case_title"],
                "chunk_id": p["chunk_id"],
                "text": p["chunk_text"],
                "page_number": p["page_number"],
                "paragraph_number": p["paragraph_number"],
                "source_url": p["source_url"],
                "relevance_score": round(float(p["similarity"]), 4),
            }
            for p in passages
        ],
        "ai_summary": {
            "label": "AI-GENERATED SUMMARY — verify against the source passages and original judgments below",
            "text": ai_summary,
            "confidence_score": confidence,
            "grounded_in_chunk_ids": [p["chunk_id"] for p in passages],
        },
    }


def _synthesize_answer(question, passages):
    """Grounded synthesis over retrieved passages. Falls back to a plain
    extractive listing (no LLM call) if no Anthropic key is configured, so
    the pipeline still runs end-to-end without an API key for testing."""
    from app.config import ANTHROPIC_API_KEY, LLM_MODEL

    if not passages:
        return "No matching passages were found in the indexed judgments for this question.", 0.0

    if not ANTHROPIC_API_KEY:
        bullet_list = "\n".join(f"- {p['case_title']}: {p['chunk_text'][:200]}..." for p in passages[:5])
        return (f"[LLM not configured — extractive fallback]\nTop matching passages:\n{bullet_list}",
                round(sum(p["similarity"] for p in passages) / len(passages), 3))

    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    context = "\n\n---\n\n".join(
        f"[{p['case_title']} | page {p['page_number']}]\n{p['chunk_text']}" for p in passages
    )
    msg = client.messages.create(
        model=LLM_MODEL,
        max_tokens=600,
        system=(
            "Answer the legal research question using ONLY the excerpts provided. "
            "Cite case titles inline. Do not use outside knowledge, and say plainly "
            "if the excerpts don't fully answer the question. Keep it concise."
        ),
        messages=[{"role": "user", "content": f"Question: {question}\n\nExcerpts:\n{context}"}],
    )
    text = "".join(b.text for b in msg.content if b.type == "text")
    avg_sim = sum(p["similarity"] for p in passages) / len(passages)
    return text, round(float(avg_sim), 3)
