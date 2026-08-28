#!/usr/bin/env python3
"""
Clean the per-page text produced by ingest_pdf.py and split it into
overlapping chunks for retrieval, preserving case_id, document_id, page
number, paragraph number, and source_url on every chunk — required so the
RAG layer can always point a lawyer back to the exact spot in the original
judgment (per the brief's verification requirement).

Usage:
    python scripts/clean_and_chunk.py --case-id sci-2023-civilappeal-1234
"""
import argparse
import json
import re
import sys

sys.path.insert(0, ".")
from app.db import get_cursor

CHUNK_TARGET_CHARS = 1200
CHUNK_OVERLAP_CHARS = 200


def clean_text(text: str) -> str:
    text = text.replace("\x0c", " ")
    text = re.sub(r"-\n(?=[a-z])", "", text)          # de-hyphenate line-wrapped words
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # strip common repeating headers/footers/page-number artifacts
    text = re.sub(r"^\s*Page \d+ of \d+\s*$", "", text, flags=re.MULTILINE)
    return text.strip()


def split_paragraphs(page_text: str):
    paras = [p.strip() for p in re.split(r"\n\s*\n", page_text) if p.strip()]
    return paras


def chunk_paragraphs(paragraphs_with_meta):
    """paragraphs_with_meta: list of (page_number, paragraph_number, text).
    Greedily merges paragraphs up to CHUNK_TARGET_CHARS, carries char overlap."""
    chunks = []
    buf = []
    buf_len = 0
    buf_page = None
    buf_para_start = None

    def flush():
        if not buf:
            return
        chunks.append({
            "text": "\n\n".join(t for _, _, t in buf),
            "page_number": buf_page,
            "paragraph_number": buf_para_start,
        })

    for page_no, para_no, text in paragraphs_with_meta:
        if buf_page is None:
            buf_page, buf_para_start = page_no, para_no
        buf.append((page_no, para_no, text))
        buf_len += len(text)
        if buf_len >= CHUNK_TARGET_CHARS:
            flush()
            # keep a small tail for overlap
            tail_text = buf[-1][2][-CHUNK_OVERLAP_CHARS:] if buf else ""
            buf = [(buf[-1][0], buf[-1][1], tail_text)] if tail_text else []
            buf_len = len(tail_text)
            buf_page, buf_para_start = (buf[0][0], buf[0][1]) if buf else (None, None)
    flush()
    return chunks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--case-id", required=True)
    ap.add_argument("--sidecar", help="path to the .pages.json produced by ingest_pdf.py; "
                                        "defaults to data/raw_pdfs/<case_id>.pages.json")
    args = ap.parse_args()
    sidecar = args.sidecar or f"data/raw_pdfs/{args.case_id}.pages.json"

    with open(sidecar, encoding="utf-8") as f:
        payload = json.load(f)
    document_id = payload["document_id"]
    pages = payload["pages"]

    with get_cursor() as cur:
        cur.execute("SELECT source_url FROM cases WHERE case_id = %s", (args.case_id,))
        row = cur.fetchone()
        if not row:
            sys.exit(f"case_id {args.case_id} not found — run load_case_metadata.py first")
        source_url = row["source_url"]

        paragraphs_with_meta = []
        for page_no, raw_text in pages:
            cleaned = clean_text(raw_text)
            for para_no, para in enumerate(split_paragraphs(cleaned), start=1):
                paragraphs_with_meta.append((page_no, para_no, para))

        chunks = chunk_paragraphs(paragraphs_with_meta)

        cur.execute("DELETE FROM case_chunks WHERE case_id = %s AND document_id = %s",
                    (args.case_id, document_id))
        for c in chunks:
            cur.execute("""
                INSERT INTO case_chunks (case_id, document_id, chunk_text, page_number,
                    paragraph_number, char_start, char_end, source_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (args.case_id, document_id, c["text"], c["page_number"], c["paragraph_number"],
                  0, len(c["text"]), source_url))

    print(f"Stored {len(chunks)} chunks for case {args.case_id} (document {document_id}).")
    print("Next: python scripts/generate_embeddings.py --case-id " + args.case_id)


if __name__ == "__main__":
    main()
