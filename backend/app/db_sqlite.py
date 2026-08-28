"""
Drop-in alternative to app/db.py for running against the bundled
data/legallens.db SQLite file instead of PostgreSQL — useful for opening
the database immediately with no server setup (e.g. to inspect it in
DB Browser for SQLite, or run the API locally against it).

To use: in app/db.py, swap the import, or set DB_BACKEND=sqlite in .env
and adapt get_cursor() to call get_cursor_sqlite() below. Note: semantic
search over `embedding_json` here does cosine similarity in Python
(see app/rag/retrieval_sqlite.py), which is fine for a demo-sized dataset
but won't scale the way pgvector's ANN index does — move to
sql/schema.sql + PostgreSQL for anything beyond local development.
"""
import json
import sqlite3
from contextlib import contextmanager

DB_PATH = "data/legallens.db"


def _dict_factory(cursor, row):
    return {col[0]: row[i] for i, col in enumerate(cursor.description)}


@contextmanager
def get_cursor_sqlite():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = _dict_factory
    conn.execute("PRAGMA foreign_keys = ON")
    cur = conn.cursor()
    try:
        yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def load_embedding(row: dict):
    raw = row.get("embedding_json")
    return json.loads(raw) if raw else None
