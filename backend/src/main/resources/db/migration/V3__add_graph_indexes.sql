-- V3__add_graph_indexes.sql
-- High-performance indexes and constraints for citation and concept/claim graph traversal

-- 1. Citation Graph Traversal Indexes
CREATE INDEX IF NOT EXISTS idx_paper_references_source_cited ON paper_references(source_paper_id, cited_paper_id);
CREATE INDEX IF NOT EXISTS idx_collection_papers_coll_paper ON collection_papers(collection_id, paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_authors_paper_author ON paper_authors(paper_id, author_id);
CREATE INDEX IF NOT EXISTS idx_papers_pub_year ON papers(publication_year);

-- 2. Claim and Concept Graph Traversal Indexes
CREATE INDEX IF NOT EXISTS idx_claim_concepts_claim_concept ON claim_concepts(claim_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_paper_concepts_paper_concept ON paper_concepts(paper_id, concept_id);
CREATE INDEX IF NOT EXISTS idx_claim_relations_source_target ON claim_relations(source_claim_id, target_claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_relation_evidence_rel_chunk ON claim_relation_evidence(claim_relation_id, evidence_chunk_id);
CREATE INDEX IF NOT EXISTS idx_claims_provenance_review ON claims(provenance_type);
CREATE INDEX IF NOT EXISTS idx_claim_relations_prov_review ON claim_relations(provenance_type, review_status);

-- 3. Check constraints for graph edge and provenance integrity if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_claim_relations_provenance'
    ) THEN
        ALTER TABLE claim_relations 
        ADD CONSTRAINT chk_claim_relations_provenance 
        CHECK (provenance_type IN ('REPORTED_IN_PAPER', 'AI_INTERPRETATION', 'USER_ASSERTED', 'HUMAN_REVIEWED'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chk_claim_relations_review_status'
    ) THEN
        ALTER TABLE claim_relations 
        ADD CONSTRAINT chk_claim_relations_review_status 
        CHECK (review_status IN ('PENDING', 'CONFIRMED', 'REJECTED'));
    END IF;
END $$;

