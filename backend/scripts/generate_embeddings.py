#!/usr/bin/env python3
"""
Generate embeddings for every chunk of a case (or all cases missing
embeddings) and store them in case_chunks.embedding via pgvector.

Usage:
    python scripts/generate_embeddings.py --case-id sci-2023-civilappeal-1234
    python scripts/generate_embeddings.py --all-missing
"""
import argparse
import sys

sys.path.insert(0, ".")
from app.db import get_cursor
from app.embeddings import embed_texts

BATCH_SIZE = 32


def run(case_id=None, all_missing=False):
    with get_cursor() as cur:
        if all_missing:
            cur.execute("SELECT chunk_id, chunk_text FROM case_chunks WHERE embedding IS NULL")
        else:
            cur.execute("SELECT chunk_id, chunk_text FROM case_chunks WHERE case_id = %s", (case_id,))
        rows = cur.fetchall()

        if not rows:
            print("Nothing to embed.")
            return

        for i in range(0, len(rows), BATCH_SIZE):
            batch = rows[i:i + BATCH_SIZE]
            vectors = embed_texts([r["chunk_text"] for r in batch])
            for r, v in zip(batch, vectors):
                cur.execute("UPDATE case_chunks SET embedding = %s WHERE chunk_id = %s", (v, r["chunk_id"]))
            print(f"Embedded {min(i + BATCH_SIZE, len(rows))}/{len(rows)} chunks")

    print("Done.")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--case-id")
    ap.add_argument("--all-missing", action="store_true")
    args = ap.parse_args()
    if not args.case_id and not args.all_missing:
        sys.exit("Pass --case-id <id> or --all-missing")
    run(case_id=args.case_id, all_missing=args.all_missing)
