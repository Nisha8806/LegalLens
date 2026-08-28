# LegalLens — Step 2: Case database, ingestion pipeline, and RAG search

Backend for the LegalLens Step 1 frontend (`legal-lens/`). Implements the
21-field case schema, a compliance-first data collection workflow for
Supreme Court of India judgments, a PDF → chunk → embedding pipeline, and a
FastAPI search/RAG layer.

**Read `docs/DATA_COLLECTION_WORKFLOW.md` first.** No data was scraped from
sci.gov.in to build this — this environment has no live network access, and
regardless, bulk scraping shouldn't be anyone's default without a
robots.txt/ToS check run at the time of collection. That doc explains
exactly what's automated, what's manual, and why.

## What's here

```
sql/schema.sql              PostgreSQL + pgvector schema (7 required tables + supporting ones)
sql/sqlite_schema.sql       Same schema, SQLite-compatible (no server needed)
data/legallens.db           Ready-to-open SQLite database file with sql/sqlite_schema.sql already applied
                             (tables created, empty — see "About data/legallens.db" below)
app/db_sqlite.py            SQLite connection helper (drop-in alternative to app/db.py for local dev)
docs/DATA_COLLECTION_WORKFLOW.md   Compliance workflow: robots.txt check, manual collection, optional bulk paths
scripts/check_robots.py     Run this yourself before any automated request to sci.gov.in
scripts/polite_fetch.py     Rate-limited, robots.txt-respecting single-file fetch template
scripts/load_case_metadata.py   Load manually-collected case metadata (CSV) into the DB
scripts/ingest_pdf.py       Extract text from a downloaded judgment PDF, hash it, store structure
scripts/clean_and_chunk.py  Clean + chunk judgment text with page/paragraph metadata
scripts/generate_embeddings.py  Embed chunks into pgvector
scripts/generate_ai_annotations.py   Generate labeled, unverified AI summaries/principles
app/                         FastAPI backend (search + case endpoints)
data/manual_metadata/cases_template.csv   Fill this in by hand from the official site
data/raw_pdfs/               Put manually-downloaded judgment PDFs here
```

## Setup

```bash
# 1. Postgres with pgvector (e.g. via the pgvector/pgvector docker image)
createdb legallens
psql legallens -f sql/schema.sql

# 2. Python env
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DATABASE_URL, embedding/LLM keys

# 3. Collect data — see docs/DATA_COLLECTION_WORKFLOW.md
python scripts/check_robots.py
# ... manually download PDFs into data/raw_pdfs/, fill in data/manual_metadata/cases_template.csv ...
python scripts/load_case_metadata.py data/manual_metadata/cases_template.csv
python scripts/ingest_pdf.py --case-id <id> --pdf data/raw_pdfs/<id>.pdf
python scripts/clean_and_chunk.py --case-id <id>
python scripts/generate_embeddings.py --case-id <id>
python scripts/generate_ai_annotations.py --case-id <id>   # optional, requires ANTHROPIC_API_KEY

# 4. Run the API
uvicorn app.main:app --reload --port 8000
```

Then in the Step 1 frontend, point `services/api.js`'s functions at
`http://localhost:8000/api/...` — the response shapes below were designed
to match what `askQuestion()`, `fetchCases()`, and `fetchCaseById()` expect.

## About `data/legallens.db`

This is a real, openable SQLite database file — not the SQL script, the
actual file. Open it directly with `sqlite3 data/legallens.db`, DB Browser
for SQLite, or Python's `sqlite3` module and you'll find all 14 tables
already created (`cases`, `judges`, `laws`, `legal_sections`,
`case_citations`, `case_documents`, `case_keywords`, `case_chunks`, etc.) —
no setup step required.

**It has no case rows in it.** I built this file from
`sql/sqlite_schema.sql` in an environment with no live network access, so
there was no way to legally populate it with real Supreme Court judgments —
and per your brief, I'm not going to fabricate case data to make it look
populated. Run the pipeline in "Setup" below (steps 3+) to load it with
real cases you've collected via `docs/DATA_COLLECTION_WORKFLOW.md`; the
`load_case_metadata.py` / `ingest_pdf.py` / etc. scripts work against
either this SQLite file (default, easiest to start with) or PostgreSQL
(swap `app/db.py` for `app/db_sqlite.py`, or point `DATABASE_URL` at
Postgres and run `sql/schema.sql` instead once you're ready for
production-scale semantic search with pgvector's ANN index).

## API surface

| Endpoint | Matches spec requirement |
|---|---|
| `GET /api/cases` | case listing |
| `GET /api/cases/{id}` | full case record: extracted fields + bench + laws/sections + citations + AI annotations (separated) |
| `GET /api/cases/{id}/similar` | similarity between cases |
| `POST /api/search/semantic` | semantic search |
| `POST /api/search/keyword` | keyword search |
| `POST /api/search/citation` | case citation search (both directions) |
| `POST /api/search/law` | law/section search |
| `POST /api/search/query` | full RAG: relevant cases + passages + citations + source URLs + confidence + labeled AI summary |

### Example: the brief's sample query

```bash
curl -X POST localhost:8000/api/search/query \
  -H 'Content-Type: application/json' \
  -d '{"question": "Find Supreme Court cases dealing with breach of contract and identify the important legal principles."}'
```

Returns:
```json
{
  "question": "...",
  "relevant_cases": [{ "case_id": "...", "case_title": "...", "citation": "...", "source_url": "...", "best_similarity": 0.83 }],
  "relevant_passages": [{ "case_id": "...", "text": "...", "page_number": 12, "paragraph_number": 3, "source_url": "...", "relevance_score": 0.83 }],
  "ai_summary": {
    "label": "AI-GENERATED SUMMARY — verify against the source passages and original judgments below",
    "text": "...",
    "confidence_score": 0.79,
    "grounded_in_chunk_ids": [101, 104, 108]
  }
}
```

Every passage carries `case_id`, `page_number`, `paragraph_number`, and
`source_url` so the frontend's existing `VerificationBadge` / "Verify
Source" flow (already built in Step 1's `DocumentViewer` +
`SourceHighlighter`) can jump straight to it — the AI summary is always a
separate, clearly labeled object, never merged into the extracted case
fields.

## Design choices worth knowing about

- **Extraction vs. generation is enforced at the schema level, not just by
  convention.** `cases.facts_of_case` / `main_legal_issues` /
  `final_judgment_order` are only ever written by `ingest_pdf.py` from PDF
  text. Anything a model wrote — summaries, "important legal principles",
  argument framing — lives only in `case_ai_annotations`, tagged with
  `model_name`, `confidence_score`, `source_chunk_ids`, and
  `human_verified` (defaults `FALSE`).
- **No invented data.** The loaders never fabricate a value for a field
  they can't find — they leave it `NULL` and print what's missing, rather
  than guessing.
- **Provenance on every record.** `cases.source_url` is `NOT NULL`;
  `case_documents.sha256_hash` lets you confirm a stored PDF still matches
  what was downloaded; `case_chunks.source_url` is duplicated onto every
  chunk so a single retrieved passage is independently citable without a
  join.
- **Embeddings are pluggable** (`app/embeddings.py`) — defaults to a local
  `sentence-transformers` model so the pipeline runs without any API key;
  switch to OpenAI embeddings via `.env` if you want higher quality (update
  `VECTOR(1536)` in `sql/schema.sql` to match the dimension you choose).
- **The RAG synthesis step degrades gracefully** — with no
  `ANTHROPIC_API_KEY` set, `/api/search/query` still returns real retrieved
  passages and cases, just with an extractive (non-LLM) fallback instead of
  a written summary, so the retrieval half of the system is testable on its
  own.
