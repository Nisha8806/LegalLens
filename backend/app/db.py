import psycopg2
import psycopg2.extras
from contextlib import contextmanager
from pgvector.psycopg2 import register_vector

from app.config import DATABASE_URL


@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL)
    register_vector(conn)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


@contextmanager
def get_cursor(dict_cursor=True):
    with get_conn() as conn:
        cur_factory = psycopg2.extras.RealDictCursor if dict_cursor else None
        cur = conn.cursor(cursor_factory=cur_factory)
        try:
            yield cur
        finally:
            cur.close()
