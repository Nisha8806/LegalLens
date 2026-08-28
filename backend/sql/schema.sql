-- ============================================================================
-- LegalLens — Step 2: PostgreSQL schema
-- Supreme Court of India case intelligence database
--
-- Design principle: EXTRACTED fields (verbatim/paraphrase-free text pulled
-- from an official judgment PDF) live in `cases`, `case_documents`, etc.
-- AI-GENERATED content (summaries, extracted "principles", argument
-- comparisons, similarity explanations) lives ONLY in `case_ai_annotations`
-- and `case_similarity`, each row carrying a model name, a confidence score,
-- a `human_verified` flag, and links back to the source chunk(s)/page(s) it
-- was generated from — so the UI can always show "AI said this, verify here".
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;      -- fuzzy / fast ILIKE keyword search
CREATE EXTENSION IF NOT EXISTS vector;       -- pgvector for embeddings

-- ----------------------------------------------------------------------------
-- cases — one row per Supreme Court judgment/order (fields 1-8, 12, 15, 20-21)
-- ----------------------------------------------------------------------------
CREATE TABLE cases (
    case_id             TEXT PRIMARY KEY,              -- e.g. 'sci-2023-civilappeal-1234'
    case_title          TEXT NOT NULL,                 -- "X v. Y"
    case_number         TEXT,                          -- e.g. "Civil Appeal No. 1234 of 2022"
    citation             TEXT,                          -- official reported citation, e.g. "(2023) 4 SCC 1"
    neutral_citation     TEXT,                          -- e.g. "2023 INSC 456"
    judgment_date        DATE,
    court                TEXT NOT NULL DEFAULT 'Supreme Court of India',
    petitioner            TEXT,
    respondent            TEXT,
    case_type             TEXT,                          -- Civil Appeal / Writ Petition / Criminal Appeal / SLP ...

    -- extracted verbatim/paraphrase-light text, sourced directly from the PDF
    facts_of_case         TEXT,
    main_legal_issues     TEXT,                          -- as stated by the court, not AI-inferred
    final_judgment_order  TEXT,

    -- provenance / compliance bookkeeping (required by the collection policy)
    source_url            TEXT NOT NULL,                 -- the sci.gov.in / e-SCR page the record came from
    document_url          TEXT,                          -- direct PDF URL, if publicly linked
    data_source           TEXT NOT NULL DEFAULT 'sci.gov.in / e-SCR',
    collection_method      TEXT NOT NULL DEFAULT 'manual_download'
                           CHECK (collection_method IN ('manual_download', 'permitted_bulk_export', 'third_party_open_dataset', 'other')),
    is_extracted_verbatim  BOOLEAN NOT NULL DEFAULT TRUE, -- FALSE if a field above was cleaned/OCR'd and may contain errors
    ingested_by             TEXT,                          -- who ran the ingestion (person/script)
    ingested_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_verified_at        TIMESTAMPTZ,                   -- last time a human re-checked this row against the PDF

    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_title_trgm ON cases USING gin (case_title gin_trgm_ops);
CREATE INDEX idx_cases_number_trgm ON cases USING gin (case_number gin_trgm_ops);
CREATE INDEX idx_cases_judgment_date ON cases (judgment_date);
CREATE INDEX idx_cases_fts ON cases USING gin (
    to_tsvector('english',
        coalesce(case_title,'') || ' ' || coalesce(facts_of_case,'') || ' ' ||
        coalesce(main_legal_issues,'') || ' ' || coalesce(final_judgment_order,''))
);

-- ----------------------------------------------------------------------------
-- judges + bench (field 6)
-- ----------------------------------------------------------------------------
CREATE TABLE judges (
    judge_id      SERIAL PRIMARY KEY,
    full_name      TEXT NOT NULL UNIQUE,
    honorific      TEXT               -- 'Hon''ble Mr. Justice', 'Hon''ble Ms. Justice', 'CJI', ...
);

CREATE TABLE case_bench (
    case_id    TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    judge_id   INT REFERENCES judges(judge_id) ON DELETE CASCADE,
    role        TEXT DEFAULT 'Bench Member',   -- 'Author', 'CJI', 'Bench Member', 'Dissenting'
    PRIMARY KEY (case_id, judge_id)
);

-- ----------------------------------------------------------------------------
-- laws + legal_sections (fields 9-10)
-- ----------------------------------------------------------------------------
CREATE TABLE laws (
    law_id       SERIAL PRIMARY KEY,
    act_name      TEXT NOT NULL,
    act_year      INT,
    jurisdiction   TEXT DEFAULT 'India',
    UNIQUE (act_name, act_year)
);

CREATE TABLE legal_sections (
    section_id      SERIAL PRIMARY KEY,
    law_id           INT REFERENCES laws(law_id) ON DELETE CASCADE,
    section_number    TEXT NOT NULL,           -- e.g. "Section 73", "Article 226"
    section_title     TEXT,
    UNIQUE (law_id, section_number)
);

CREATE TABLE case_laws (                        -- acts mentioned in a case
    case_id   TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    law_id     INT REFERENCES laws(law_id) ON DELETE CASCADE,
    PRIMARY KEY (case_id, law_id)
);

CREATE TABLE case_legal_sections (               -- specific sections/provisions invoked
    case_id      TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    section_id    INT REFERENCES legal_sections(section_id) ON DELETE CASCADE,
    context_note   TEXT,                          -- e.g. "held to apply", "distinguished" — extracted, not inferred
    PRIMARY KEY (case_id, section_id)
);

-- ----------------------------------------------------------------------------
-- case_citations — precedents cited BY a case, and cases that cite it back
-- (fields 17-18). Self-referential; `cited_case_text` holds the raw citation
-- string when the cited case isn't (yet) in our own `cases` table.
-- ----------------------------------------------------------------------------
CREATE TABLE case_citations (
    citation_id       BIGSERIAL PRIMARY KEY,
    citing_case_id     TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    cited_case_id       TEXT REFERENCES cases(case_id) ON DELETE SET NULL,  -- NULL if not in our DB
    cited_case_text      TEXT NOT NULL,                                       -- raw citation as it appears in the judgment
    treatment            TEXT,                                                -- 'followed' / 'distinguished' / 'overruled' / 'referred' — only if stated in the text
    is_extracted           BOOLEAN NOT NULL DEFAULT TRUE                        -- TRUE = parsed from judgment text; FALSE = AI-inferred link
);

CREATE INDEX idx_case_citations_citing ON case_citations (citing_case_id);
CREATE INDEX idx_case_citations_cited ON case_citations (cited_case_id);

-- ----------------------------------------------------------------------------
-- case_documents — the source PDFs/orders (field 21) + provenance hash
-- ----------------------------------------------------------------------------
CREATE TABLE case_documents (
    document_id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id          TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    document_type     TEXT DEFAULT 'judgment',   -- 'judgment' | 'order' | 'annexure'
    file_url           TEXT,                        -- public sci.gov.in / e-SCR PDF URL
    local_path          TEXT,                        -- where the permitted download is stored, if any
    page_count           INT,
    sha256_hash           TEXT,                        -- integrity check against the official file
    downloaded_at         TIMESTAMPTZ,
    ocr_used               BOOLEAN DEFAULT FALSE
);

-- ----------------------------------------------------------------------------
-- case_keywords (field 19)
-- ----------------------------------------------------------------------------
CREATE TABLE case_keywords (
    case_id    TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    keyword     TEXT NOT NULL,
    source       TEXT NOT NULL DEFAULT 'extracted' CHECK (source IN ('extracted', 'ai_generated')),
    PRIMARY KEY (case_id, keyword)
);

-- ----------------------------------------------------------------------------
-- case_ai_annotations — ALL AI-generated content lives here, clearly tagged
-- (field 11 "arguments" analysis, field 13 issue framing beyond what the
-- court itself stated, field 16 "important legal principles" when phrased
-- by the model rather than quoted, case summaries, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE case_ai_annotations (
    annotation_id      BIGSERIAL PRIMARY KEY,
    case_id              TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    annotation_type       TEXT NOT NULL CHECK (annotation_type IN (
                              'case_summary',
                              'petitioner_arguments',
                              'respondent_arguments',
                              'court_reasoning_summary',
                              'legal_principle',
                              'issue_summary'
                          )),
    content                TEXT NOT NULL,
    confidence_score        NUMERIC(4,3),               -- 0.000 - 1.000
    model_name               TEXT NOT NULL,               -- e.g. 'claude-sonnet-4-6'
    prompt_version            TEXT,
    source_chunk_ids           BIGINT[],                    -- case_chunks.chunk_id this was grounded in
    generated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    human_verified              BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by                  TEXT,
    verified_at                  TIMESTAMPTZ
);

CREATE INDEX idx_ai_annotations_case ON case_ai_annotations (case_id, annotation_type);

-- ----------------------------------------------------------------------------
-- case_chunks — RAG store: cleaned judgment text split into passages, each
-- with page/paragraph metadata and an embedding (pgvector)
-- ----------------------------------------------------------------------------
CREATE TABLE case_chunks (
    chunk_id        BIGSERIAL PRIMARY KEY,
    case_id           TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    document_id        UUID REFERENCES case_documents(document_id) ON DELETE CASCADE,
    chunk_text          TEXT NOT NULL,
    page_number          INT,
    paragraph_number      INT,
    section_label          TEXT,                 -- e.g. 'Facts', 'Issues', 'Reasoning', 'Order' if detectable
    char_start              INT,
    char_end                INT,
    token_count               INT,
    source_url                 TEXT NOT NULL,        -- duplicated from cases.source_url for standalone citability
    embedding                   VECTOR(1536),          -- adjust dim to your embedding model
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_case_chunks_case ON case_chunks (case_id);
CREATE INDEX idx_case_chunks_fts ON case_chunks USING gin (to_tsvector('english', chunk_text));
-- HNSW index for cosine similarity search (pgvector >= 0.5.0)
CREATE INDEX idx_case_chunks_embedding_hnsw ON case_chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ----------------------------------------------------------------------------
-- case_similarity — precomputed / cached "similar cases" (AI-derived; not a
-- ground-truth citation relationship, so kept separate from case_citations)
-- ----------------------------------------------------------------------------
CREATE TABLE case_similarity (
    case_id_a       TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    case_id_b       TEXT REFERENCES cases(case_id) ON DELETE CASCADE,
    similarity_score NUMERIC(5,4) NOT NULL,   -- cosine similarity, 0-1
    method            TEXT NOT NULL DEFAULT 'embedding_centroid_cosine',
    computed_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (case_id_a, case_id_b)
);

-- ----------------------------------------------------------------------------
-- query_log — every RAG answer served, so a lawyer can audit what was shown
-- ----------------------------------------------------------------------------
CREATE TABLE query_log (
    query_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text       TEXT NOT NULL,
    query_type        TEXT NOT NULL DEFAULT 'semantic' CHECK (query_type IN ('semantic','keyword','citation','law_section','similarity')),
    retrieved_chunk_ids BIGINT[],
    ai_answer          TEXT,
    ai_model             TEXT,
    confidence_score      NUMERIC(4,3),
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
