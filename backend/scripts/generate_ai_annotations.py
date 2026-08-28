#!/usr/bin/env python3
"""
Generate AI-derived content for a case — case summary, extracted "important
legal principles", argument framing — and store it ONLY in
case_ai_annotations, never overwriting anything in `cases`. Every row is
tagged with the model name, links back to the chunk_ids it was grounded in,
and starts human_verified = FALSE.

This deliberately does NOT try to invent facts, arguments, or reasoning
beyond what's in the retrieved chunks — the prompt instructs the model to
say so explicitly if the chunks don't cover something, and that gets stored
as-is rather than silently dropped or filled in.

Usage:
    python scripts/generate_ai_annotations.py --case-id sci-2023-civilappeal-1234
"""
import argparse
import sys

sys.path.insert(0, ".")
from app.db import get_cursor
from app.config import ANTHROPIC_API_KEY, LLM_MODEL

ANNOTATION_PROMPTS = {
    "case_summary": "Write a 3-4 sentence plain-English summary of what this judgment decided.",
    "legal_principle": "List the important legal principles this judgment establishes or applies, "
                        "as a short bulleted list. If the excerpts don't clearly state a principle, say so.",
    "petitioner_arguments": "Summarize the petitioner's/appellant's main arguments as they appear in these excerpts.",
    "respondent_arguments": "Summarize the respondent's main arguments as they appear in these excerpts.",
    "court_reasoning_summary": "Summarize the court's reasoning in reaching its decision, based only on these excerpts.",
}


def build_context(chunks):
    return "\n\n---\n\n".join(
        f"[chunk_id={c['chunk_id']} page={c['page_number']}]\n{c['chunk_text']}" for c in chunks
    )


def call_llm(system_prompt, context):
    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    msg = client.messages.create(
        model=LLM_MODEL,
        max_tokens=800,
        system=(
            "You are drafting an internal annotation for a legal research tool. "
            "Base your answer ONLY on the excerpts provided below — do not use "
            "outside knowledge of the case, and do not invent facts, names, or "
            "outcomes not present in the excerpts. If the excerpts are "
            "insufficient to answer confidently, say so explicitly instead of "
            "guessing. This output will be labeled as AI-generated and shown "
            "next to the source excerpts for a lawyer to verify."
        ),
        messages=[{"role": "user", "content": f"{system_prompt}\n\nExcerpts:\n{context}"}],
    )
    return "".join(b.text for b in msg.content if b.type == "text")


def run(case_id):
    with get_cursor() as cur:
        cur.execute("""
            SELECT chunk_id, page_number, chunk_text FROM case_chunks
            WHERE case_id = %s ORDER BY page_number, paragraph_number LIMIT 40
        """, (case_id,))
        chunks = cur.fetchall()
        if not chunks:
            sys.exit(f"No chunks found for {case_id} — run clean_and_chunk.py first")

        context = build_context(chunks)
        chunk_ids = [c["chunk_id"] for c in chunks]

        for annotation_type, prompt in ANNOTATION_PROMPTS.items():
            content = call_llm(prompt, context)
            cur.execute("""
                INSERT INTO case_ai_annotations
                    (case_id, annotation_type, content, model_name, source_chunk_ids, human_verified)
                VALUES (%s, %s, %s, %s, %s, FALSE)
            """, (case_id, annotation_type, content, LLM_MODEL, chunk_ids))
            print(f"Stored [{annotation_type}] annotation ({len(content)} chars), unverified.")

    print("\nAll annotations stored in case_ai_annotations with human_verified = FALSE.")
    print("A reviewer should confirm each against the source chunks before it's")
    print("surfaced as trusted — see VerificationBadge in the frontend.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--case-id", required=True)
    args = ap.parse_args()
    if not ANTHROPIC_API_KEY:
        sys.exit("Set ANTHROPIC_API_KEY in .env first.")
    run(args.case_id)
