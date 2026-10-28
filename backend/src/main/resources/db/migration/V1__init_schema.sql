-- Enable pgvector and UUID extensions if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- 3. Papers
CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    abstract TEXT,
    doi VARCHAR(100),
    publication_year INT,
    venue VARCHAR(255),
    document_path VARCHAR(500),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    processing_error TEXT,
    visibility VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_papers_owner_year ON papers(owner_id, publication_year);
CREATE INDEX IF NOT EXISTS idx_papers_doi ON papers(doi);
CREATE INDEX IF NOT EXISTS idx_papers_visibility ON papers(visibility);

-- 4. Authors
CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    normalized_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    orcid VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_authors_norm_name ON authors(normalized_name);

-- 5. Paper Authors junction
CREATE TABLE IF NOT EXISTS paper_authors (
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    author_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY(paper_id, author_id)
);

-- 6. Paper References (citations between papers or extracted text)
CREATE TABLE IF NOT EXISTS paper_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    raw_reference_text TEXT NOT NULL,
    cited_paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
    cited_title TEXT,
    cited_doi VARCHAR(100),
    resolution_status VARCHAR(50) NOT NULL DEFAULT 'UNRESOLVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paper_references_source ON paper_references(source_paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_references_cited ON paper_references(cited_paper_id);

-- 7. Document Chunks
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    section_name VARCHAR(100) NOT NULL DEFAULT 'Body',
    page_number INT,
    char_start INT NOT NULL DEFAULT 0,
    char_end INT NOT NULL DEFAULT 0,
    content TEXT NOT NULL,
    token_count INT NOT NULL DEFAULT 0,
    embedding vector(384),
    embedding_model VARCHAR(100) DEFAULT 'all-minilm-l6-v2',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chunks_paper_index ON document_chunks(paper_id, chunk_index);

-- Full text search indexes on papers and chunks
CREATE INDEX IF NOT EXISTS idx_papers_fts ON papers USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(abstract, '')));
CREATE INDEX IF NOT EXISTS idx_chunks_fts ON document_chunks USING gin(to_tsvector('english', content));

-- 8. Concepts (Topics, Methods, Datasets, Metrics)
CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    normalized_name VARCHAR(200) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    concept_type VARCHAR(50) NOT NULL DEFAULT 'TOPIC', -- METHOD, DATASET, METRIC, PROBLEM, TOPIC
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Paper Concepts
CREATE TABLE IF NOT EXISTS paper_concepts (
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL DEFAULT 'PROPOSES', -- USES, EVALUATES_ON, PROPOSES, EXTENDS
    evidence_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    provenance_type VARCHAR(50) NOT NULL DEFAULT 'REPORTED_IN_PAPER',
    PRIMARY KEY(paper_id, concept_id, relation_type)
);

-- 10. Claims
CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    source_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    normalized_text TEXT NOT NULL,
    source_text TEXT NOT NULL,
    claim_type VARCHAR(50) NOT NULL DEFAULT 'FINDING', -- FINDING, HYPOTHESIS, METHOD_ASSERTION, LIMITATION, DATASET_ASSERTION, BACKGROUND
    provenance_type VARCHAR(50) NOT NULL DEFAULT 'REPORTED_IN_PAPER', -- REPORTED_IN_PAPER, AI_INTERPRETATION, USER_ASSERTED
    extraction_confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    section_name VARCHAR(100),
    page_number INT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_claims_paper ON claims(paper_id);
CREATE INDEX IF NOT EXISTS idx_claims_chunk ON claims(source_chunk_id);

-- 11. Claim Concepts
CREATE TABLE IF NOT EXISTS claim_concepts (
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relation_role VARCHAR(50) NOT NULL DEFAULT 'SUBJECT', -- SUBJECT, OBJECT, METRIC, CONDITION
    PRIMARY KEY(claim_id, concept_id)
);

-- 12. Claim Relations (Supports, Contradicts, Qualifies, Extends, Discusses, Duplicates, Unrelated)
CREATE TABLE IF NOT EXISTS claim_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    target_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL, -- SUPPORTS, CONTRADICTS, QUALIFIES, EXTENDS, DISCUSSES, DUPLICATES, UNRELATED
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    rationale TEXT NOT NULL,
    provenance_type VARCHAR(50) NOT NULL DEFAULT 'AI_INTERPRETATION', -- AI_INTERPRETATION, USER_ASSERTED
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, CONFIRMED, REJECTED
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_diff_claims CHECK (source_claim_id <> target_claim_id)
);

CREATE INDEX IF NOT EXISTS idx_claim_relations_source ON claim_relations(source_claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_relations_target ON claim_relations(target_claim_id);

-- 13. Claim Relation Evidence
CREATE TABLE IF NOT EXISTS claim_relation_evidence (
    claim_relation_id UUID NOT NULL REFERENCES claim_relations(id) ON DELETE CASCADE,
    evidence_chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    evidence_role VARCHAR(50) NOT NULL DEFAULT 'SOURCE_EVIDENCE', -- SOURCE_EVIDENCE, TARGET_EVIDENCE, CONTEXT
    PRIMARY KEY(claim_relation_id, evidence_chunk_id)
);

-- 14. Annotations
CREATE TABLE IF NOT EXISTS annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    annotation_type VARCHAR(50) NOT NULL DEFAULT 'NOTE', -- NOTE, CRITIQUE, QUESTION, HIGHLIGHT
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_annotations_paper ON annotations(paper_id);
CREATE INDEX IF NOT EXISTS idx_annotations_claim ON annotations(claim_id);

-- 15. Collections
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_collections_owner ON collections(owner_id);

-- 16. Collection Papers
CREATE TABLE IF NOT EXISTS collection_papers (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(collection_id, paper_id)
);

-- 17. Ingestion Jobs
CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, PARSING, CHUNKING, EMBEDDING, EXTRACTING_ASPECTS, COMPLETED, FAILED
    current_stage VARCHAR(100) NOT NULL DEFAULT 'INITIALIZED',
    warning_message TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_paper ON ingestion_jobs(paper_id);

-- 18. Generated Reviews
CREATE TABLE IF NOT EXISTS generated_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    title VARCHAR(300) NOT NULL,
    content_markdown TEXT NOT NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'mock-ai-engine',
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_generated_reviews_owner ON generated_reviews(owner_id);

-- 19. Review Evidence (Links paragraph index in generated review to source chunk)
CREATE TABLE IF NOT EXISTS review_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES generated_reviews(id) ON DELETE CASCADE,
    paragraph_index INT NOT NULL,
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    citation_label VARCHAR(100) NOT NULL,
    evidence_role VARCHAR(50) NOT NULL DEFAULT 'PRIMARY_SUPPORT' -- PRIMARY_SUPPORT, BACKGROUND, QUALIFICATION, CONTRADICTION
);

CREATE INDEX IF NOT EXISTS idx_review_evidence_review ON review_evidence(review_id);
CREATE INDEX IF NOT EXISTS idx_review_evidence_chunk ON review_evidence(chunk_id);
