-- V2: Real Scholarly Data Sources, External Identifiers & Open Access Links

CREATE TABLE IF NOT EXISTS paper_external_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    external_url VARCHAR(1000),
    canonical_doi VARCHAR(150),
    metadata_source VARCHAR(100) NOT NULL,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paper_ext_ids_paper ON paper_external_identifiers(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_ext_ids_provider ON paper_external_identifiers(provider, external_id);
CREATE INDEX IF NOT EXISTS idx_paper_ext_ids_doi ON paper_external_identifiers(canonical_doi);

CREATE TABLE IF NOT EXISTS paper_access_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    link_type VARCHAR(50) NOT NULL DEFAULT 'PDF',
    access_status VARCHAR(50) NOT NULL DEFAULT 'UNKNOWN',
    license_name VARCHAR(150),
    source_provider VARCHAR(50) NOT NULL,
    checked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_paper_access_links_paper ON paper_access_links(paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_access_links_status ON paper_access_links(access_status);
