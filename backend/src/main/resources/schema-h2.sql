-- H2 schema for unit & integration testing
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS papers (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(1000) NOT NULL,
    abstract CLOB,
    doi VARCHAR(100),
    publication_year INT,
    venue VARCHAR(255),
    document_path VARCHAR(500),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    processing_error CLOB,
    visibility VARCHAR(30) NOT NULL DEFAULT 'PRIVATE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS authors (
    id UUID PRIMARY KEY,
    normalized_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    orcid VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS paper_authors (
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    author_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY(paper_id, author_id)
);

CREATE TABLE IF NOT EXISTS paper_references (
    id UUID PRIMARY KEY,
    source_paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    raw_reference_text CLOB NOT NULL,
    cited_paper_id UUID REFERENCES papers(id) ON DELETE SET NULL,
    cited_title VARCHAR(1000),
    cited_doi VARCHAR(100),
    resolution_status VARCHAR(50) NOT NULL DEFAULT 'UNRESOLVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY,
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    section_name VARCHAR(100) NOT NULL DEFAULT 'Body',
    page_number INT,
    char_start INT NOT NULL DEFAULT 0,
    char_end INT NOT NULL DEFAULT 0,
    content CLOB NOT NULL,
    token_count INT NOT NULL DEFAULT 0,
    embedding VARCHAR(10000),
    embedding_model VARCHAR(100) DEFAULT 'mock-embedding',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS concepts (
    id UUID PRIMARY KEY,
    normalized_name VARCHAR(200) NOT NULL UNIQUE,
    display_name VARCHAR(200) NOT NULL,
    concept_type VARCHAR(50) NOT NULL DEFAULT 'TOPIC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS paper_concepts (
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL DEFAULT 'PROPOSES',
    evidence_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    provenance_type VARCHAR(50) NOT NULL DEFAULT 'REPORTED_IN_PAPER',
    PRIMARY KEY(paper_id, concept_id, relation_type)
);

CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY,
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    source_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    normalized_text CLOB NOT NULL,
    source_text CLOB NOT NULL,
    claim_type VARCHAR(50) NOT NULL DEFAULT 'FINDING',
    provenance_type VARCHAR(50) NOT NULL DEFAULT 'REPORTED_IN_PAPER',
    extraction_confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    section_name VARCHAR(100),
    page_number INT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claim_concepts (
    claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    concept_id UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
    relation_role VARCHAR(50) NOT NULL DEFAULT 'SUBJECT',
    PRIMARY KEY(claim_id, concept_id)
);

CREATE TABLE IF NOT EXISTS claim_relations (
    id UUID PRIMARY KEY,
    source_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    target_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL,
    confidence DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    rationale CLOB NOT NULL,
    provenance_type VARCHAR(50) NOT NULL DEFAULT 'AI_INTERPRETATION',
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS claim_relation_evidence (
    claim_relation_id UUID NOT NULL REFERENCES claim_relations(id) ON DELETE CASCADE,
    evidence_chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    evidence_role VARCHAR(50) NOT NULL DEFAULT 'SOURCE_EVIDENCE',
    PRIMARY KEY(claim_relation_id, evidence_chunk_id)
);

CREATE TABLE IF NOT EXISTS annotations (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES document_chunks(id) ON DELETE CASCADE,
    claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
    body CLOB NOT NULL,
    annotation_type VARCHAR(50) NOT NULL DEFAULT 'NOTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description CLOB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_papers (
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(collection_id, paper_id)
);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id UUID PRIMARY KEY,
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    current_stage VARCHAR(100) NOT NULL DEFAULT 'INITIALIZED',
    warning_message CLOB,
    error_message CLOB,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS generated_reviews (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    query CLOB NOT NULL,
    title VARCHAR(300) NOT NULL,
    content_markdown CLOB NOT NULL,
    model_name VARCHAR(100) NOT NULL DEFAULT 'mock-ai-engine',
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_evidence (
    id UUID PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES generated_reviews(id) ON DELETE CASCADE,
    paragraph_index INT NOT NULL,
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE CASCADE,
    citation_label VARCHAR(100) NOT NULL,
    evidence_role VARCHAR(50) NOT NULL DEFAULT 'PRIMARY_SUPPORT'
);
