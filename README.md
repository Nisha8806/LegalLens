# LegalLens — combined project (frontend + backend)

```
legallens-combined/
  frontend/     Step 1 React app (your uploaded legal-lens project, unmodified)
  backend/      Step 2 database, ingestion pipeline, and RAG search API
```

## Quick start

**Backend first:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Uses the bundled backend/data/legallens.db (SQLite) out of the box —
# see backend/README.md for switching to PostgreSQL + pgvector.
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Frontend currently runs on demo data from `frontend/src/data/` via
`frontend/src/services/api.js`. To connect it to the backend, edit that
file's functions to `fetch()` from `http://localhost:8000/api/...` instead
of returning the sample data — the response shapes were designed to match
(see `backend/README.md`'s "API surface" section for the exact endpoints
and what each returns).

## Where things stand

- **`frontend/`** — complete, working UI against demo data. Not modified
  by me; it's exactly what you uploaded.
- **`backend/`** — schema (PostgreSQL + pgvector, and a portable SQLite
  file already built at `backend/data/legallens.db`), ingestion pipeline,
  and a FastAPI search/RAG layer. Tables are created but **empty** — see
  `backend/docs/DATA_COLLECTION_WORKFLOW.md` for how to legally collect
  real Supreme Court of India judgments and load them in; I have no live
  network access in this environment and won't fabricate case data.
- **Not yet done:** wiring `frontend/src/services/api.js` to actually call
  the backend endpoints instead of the sample data. That's a small, mostly
  mechanical edit once you're ready — happy to do it in this conversation
  when you want.

See `backend/README.md` for full backend details and `frontend/README.md`
for frontend details.
