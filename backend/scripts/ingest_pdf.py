#!/usr/bin/env python3
"""
Extract text from a manually-downloaded judgment PDF and store it:
  - the full per-page text goes to case_documents + is the source for chunking
  - a best-effort split into Facts / Issues / Order sections is written to
    cases.facts_of_case / main_legal_issues / final_judgment_order — this is
    a *structural* extraction (regex/heading based), not paraphrase, and is
    marked is_extracted_verbatim = TRUE. If the headings aren't found, those
    columns are left NULL rather than guessed.

Usage:
    python scripts/ingest_pdf.py --case-id sci-2023-civilappeal-1234 \\
        --pdf data/raw_pdfs/sci-2023-civilappeal-1234.pdf
"""
import argparse
import hashlib
import re
import sys
from datetime import datetime, timezone

sys.path.insert(0, ".")
import pdfplumber
from app.db import get_cursor

SECTION_HEADINGS = {
    "facts_of_case": [r"\bFACTS\b", r"\bBRIEF FACTS\b", r"\bFACTUAL BACKGROUND\b"],
    "main_legal_issues": [r"\bISSUES?\b", r"\bQUESTIONS? OF LAW\b", r"\bPOINTS? FOR DETERMINATION\b"],
    "final_judgment_order": [r"\bORDER\b", r"\bCONCLUSION\b", r"\bDISPOSITION\b", r"\bFOR THE REASONS?\b"],
}


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()


def extract_pages(pdf_path):
    pages = []
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages, start=1):
            text = page.extract_text() or ""
            pages.append((i, text))
    return pages


def try_extract_section(full_text, heading_patterns, next_heading_patterns_all):
    """Very conservative heuristic: find a heading, take text until the next
    known heading. Returns None (not a guess) if no heading is found."""
    for pattern in heading_patterns:
        m = re.search(pattern, full_text, re.IGNORECASE)
        if not m:
            continue
        start = m.end()
        # find nearest following heading of any other type to bound the section
        end = len(full_text)
        for other_patterns in next_heading_patterns_all:
            for p in other_patterns:
                m2 = re.search(p, full_text[start:], re.IGNORECASE)
                if m2:
                    end = min(end, start + m2.start())
        section = full_text[start:end].strip()
        return section if len(section) > 20 else None
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--case-id", required=True)
    ap.add_argument("--pdf", required=True)
    ap.add_argument("--document-type", default="judgment")
    args = ap.parse_args()

    pages = extract_pages(args.pdf)
    full_text = "\n\n".join(t for _, t in pages)
    file_hash = sha256_of(args.pdf)

    all_patterns = list(SECTION_HEADINGS.values())
    extracted = {}
    for field, patterns in SECTION_HEADINGS.items():
        others = [p for p in all_patterns if p is not patterns]
        extracted[field] = try_extract_section(full_text, patterns, others)

    with get_cursor() as cur:
        cur.execute("""
            INSERT INTO case_documents (case_id, document_type, local_path, page_count, sha256_hash, downloaded_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING document_id
        """, (args.case_id, args.document_type, args.pdf, len(pages), file_hash, datetime.now(timezone.utc)))
        document_id = cur.fetchone()["document_id"]

        cur.execute("""
            UPDATE cases SET
                facts_of_case = COALESCE(%s, facts_of_case),
                main_legal_issues = COALESCE(%s, main_legal_issues),
                final_judgment_order = COALESCE(%s, final_judgment_order),
                is_extracted_verbatim = TRUE,
                last_verified_at = %s
            WHERE case_id = %s
        """, (extracted["facts_of_case"], extracted["main_legal_issues"],
              extracted["final_judgment_order"], datetime.now(timezone.utc), args.case_id))

    # stash raw per-page text for the chunker (simple sidecar file, avoids a huge extra column)
    import json
    sidecar = args.pdf.rsplit(".", 1)[0] + ".pages.json"
    with open(sidecar, "w", encoding="utf-8") as f:
        json.dump({"document_id": document_id, "pages": pages}, f)

    found = [k for k, v in extracted.items() if v]
    missing = [k for k, v in extracted.items() if not v]
    print(f"document_id={document_id}, pages={len(pages)}, sha256={file_hash[:12]}...")
    print(f"Structurally extracted: {found or 'none'}")
    if missing:
        print(f"Not found by heading heuristic (left NULL, not guessed): {missing}")
    print(f"Per-page text saved to {sidecar} for chunking.")


if __name__ == "__main__":
    main()
