-- ============================================================================
-- LegalLens — SQLite schema (portable single-file counterpart to sql/schema.sql)
--
-- Use this to get an actual, openable database FILE with no server setup —
-- good for local development, review, or handing the file to someone else.
-- For production (real semantic search at scale via pgvector's ANN index),
-- use sql/schema.sql against PostgreSQL instead; this version stores each
-- embedding as a JSON array of floats in a TEXT column (`embedding_json`)
-- since SQLite has no native vector type, and app/db_sqlite.py computes
-- cosine similarity in Python at query time.
--
-- Same table names, same columns, same extraction-vs-AI-generated
-- separation as the PostgreSQL schema.
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE cases (
    case_id             TEXT PRIMARY KEY,
    case_title          TEXT NOT NULL,
    case_number         TEXT,
    citation             TEXT,
    neutral_citation     TEXT,
    judgment_date        TEXT,                 -- ISO date string 'YYYY-MM-DD'
    court                TEXT NOT NULL DEFAULT 'Supreme Court of India',
    petitioner            TEXT,
    respondent            TEXT,
    case_type             TEXT,

    facts_of_case         TEXT,
    main_legal_issues     TEXT,
    final_judgment_order  TEXT,

    source_url            TEXT NOT NULL,
    document_url          TEXT,
    data_source            TEXT NOT NULL DEFAULT 'sci.gov.in / e-SCR',
    collection_method       TEXT NOT NULL DEFAULT 'manual_download'
                            CHECK (collection_method IN ('manual_download', 'permitted_bulk_export', 'third_party_open_dataset', 'other')),
    is_extracted_verbatim   INTEGER NOT NULL DEFAULT 1,
    ingested_by              TEXT,
    ingested_at              TEXT NOT NULL DEFAULT (datetime('now')),
    last_verified_at         TEXT,

    created_at              TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_cases_judgment_date ON cases (judgment_date);
CREATE INDEX idx_cases_title ON cases (case_title);
CREATE INDEX idx_cases_number ON cases (case_number);

CREATE TABLE judges (
    judge_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name      TEXT NOT NULL UNIQUE,
    honorific      TEXT
);

CREATE TABLE case_bench (
    case_id    TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    judge_id   INTEGER REFERENCES judges(judge_id) ON DELETE CASCADE,
    role        TEXT DEFAULT 'Bench Member',
    PRIMARY KEY (case_id, judge_id)
);

CREATE TABLE laws (
    law_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    act_name      TEXT NOT NULL,
    act_year      INTEGER,
    jurisdiction   TEXT DEFAULT 'India',
    UNIQUE (act_name, act_year)
);

CREATE TABLE legal_sections (
    section_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    law_id           INTEGER REFERENCES laws(law_id) ON DELETE CASCADE,
    section_number    TEXT NOT NULL,
    section_title     TEXT,
    UNIQUE (law_id, section_number)
);

CREATE TABLE case_laws (
    case_id   TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    law_id     INTEGER REFERENCES laws(law_id) ON DELETE CASCADE,
    PRIMARY KEY (case_id, law_id)
);

CREATE TABLE case_legal_sections (
    case_id      TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    section_id    INTEGER REFERENCES legal_sections(section_id) ON DELETE CASCADE,
    context_note   TEXT,
    PRIMARY KEY (case_id, section_id)
);

CREATE TABLE case_citations (
    citation_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    citing_case_id     TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    cited_case_id       TEXT REFERENCES cases(case_id) ON DELETE SET NULL,
    cited_case_text      TEXT NOT NULL,
    treatment            TEXT,
    is_extracted           INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_case_citations_citing ON case_citations (citing_case_id);
CREATE INDEX idx_case_citations_cited ON case_citations (cited_case_id);

CREATE TABLE case_documents (
    document_id     TEXT PRIMARY KEY,           -- generate a uuid4 string in app code
    case_id          TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    document_type     TEXT DEFAULT 'judgment',
    file_url           TEXT,
    local_path          TEXT,
    page_count           INTEGER,
    sha256_hash           TEXT,
    downloaded_at         TEXT,
    ocr_used               INTEGER DEFAULT 0
);

CREATE TABLE case_keywords (
    case_id    TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    keyword     TEXT NOT NULL,
    source       TEXT NOT NULL DEFAULT 'extracted' CHECK (source IN ('extracted', 'ai_generated')),
    PRIMARY KEY (case_id, keyword)
);

CREATE TABLE case_ai_annotations (
    annotation_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id              TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    annotation_type       TEXT NOT NULL CHECK (annotation_type IN (
                              'case_summary', 'petitioner_arguments', 'respondent_arguments',
                              'court_reasoning_summary', 'legal_principle', 'issue_summary'
                          )),
    content                TEXT NOT NULL,
    confidence_score        REAL,
    model_name               TEXT NOT NULL,
    prompt_version            TEXT,
    source_chunk_ids           TEXT,               -- JSON array of chunk_ids, e.g. '[101,104]'
    generated_at               TEXT NOT NULL DEFAULT (datetime('now')),
    human_verified              INTEGER NOT NULL DEFAULT 0,
    verified_by                  TEXT,
    verified_at                  TEXT
);

CREATE INDEX idx_ai_annotations_case ON case_ai_annotations (case_id, annotation_type);

CREATE TABLE case_chunks (
    chunk_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id           TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    document_id        TEXT REFERENCES case_documents(document_id) ON DELETE CASCADE,
    chunk_text          TEXT NOT NULL,
    page_number          INTEGER,
    paragraph_number      INTEGER,
    section_label          TEXT,
    char_start              INTEGER,
    char_end                INTEGER,
    token_count               INTEGER,
    source_url                 TEXT NOT NULL,
    embedding_json              TEXT,             -- JSON array of floats; cosine sim computed in Python
    created_at                   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_case_chunks_case ON case_chunks (case_id);

CREATE TABLE case_similarity (
    case_id_a       TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    case_id_b       TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    similarity_score REAL NOT NULL,
    method            TEXT NOT NULL DEFAULT 'embedding_centroid_cosine',
    computed_at        TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (case_id_a, case_id_b)
);

CREATE TABLE query_log (
    query_id       TEXT PRIMARY KEY,             -- generate a uuid4 string in app code
    query_text       TEXT NOT NULL,
    query_type        TEXT NOT NULL DEFAULT 'semantic' CHECK (query_type IN ('semantic','keyword','citation','law_section','similarity')),
    retrieved_chunk_ids TEXT,                       -- JSON array
    ai_answer          TEXT,
    ai_model             TEXT,
    confidence_score      REAL,
    created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);
