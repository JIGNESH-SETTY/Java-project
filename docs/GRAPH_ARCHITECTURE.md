# Knowledge & Evidence Graph Architecture

## 1. Overview & Core Philosophy

The **AI Research Discovery and Evidence Engine** provides two distinct graph representations of academic literature:
1. **Bibliographic Citation Graph** (`/graph/citations`): Visualizes explicit bibliographic citation networks connecting research papers across years, venues, and authors.
2. **Concept & Claim Evidence Graph** (`/graph/concepts`): Visualizes multi-entity semantic knowledge graphs connecting research papers, topics, methods, datasets, normalized scientific claims, and cross-paper consensus relationships (Supports, Contradicts, Qualifies, Extends).

### Zero-Hallucination & Provenance Rule
No graph relationship or node is fabricated. Every entity and edge in the live database originates from either:
- **`REPORTED_IN_PAPER`**: Grounded directly in an extracted paper, metadata, or verbatim chunk text.
- **`AI_INTERPRETATION`**: Proposed by an AI model based on linked evidence chunks. **Must be displayed with dashed borders, labeled "AI proposed", and include a prominent review warning.**
- **`USER_ASSERTED`**: Created directly by an authenticated researcher.
- **`HUMAN_REVIEWED`**: An AI-proposed relationship that was explicitly audited, verified, or rejected by a human domain expert.

---

## 2. Graph Entity & Edge Model

### Node Classification

| Node Type | Cytoscape Shape | Color Token | Meaning |
|---|---|---|---|
| `PAPER` | `round-rectangle` | `#4F46E5` (Indigo) | Imported or indexed research paper |
| `CONCEPT` | `ellipse` | `#0D9488` (Teal) | Topic, domain concept, problem, or metric |
| `CLAIM` | `hexagon` | `#7C3AED` (Violet) | Normalized atomic scientific claim |
| `METHOD` | `diamond` | `#2563EB` (Blue) | Algorithm, architecture, or model (e.g. Transformer, BERT) |
| `DATASET` | `round-rectangle` | `#D97706` (Amber) | Benchmark or training dataset (e.g. GLUE, SQuAD, WMT14) |
| `CHUNK` | `rectangle` | `#475569` (Slate) | Verbatim source passage extracted from PDF |
| `AI_INTERPRETATION` | `round-rectangle` (dashed) | `#F3E8FF` (Lavender) | Multi-paper AI synthesis or hypothesis |
| `UNRESOLVED_PAPER` | `rectangle` (dashed) | `#E2E8F0` (Muted Gray) | External bibliographic reference not yet in local library |

### Edge Classification

| Edge Type | Stroke Style | Color Token | Arrow | Semantic Meaning |
|---|---|---|---|---|
| `CITES` | Solid | `#64748B` (Slate) | Directed | Source paper cites target paper |
| `REPORTS` | Solid | `#2563EB` (Blue) | Directed | Paper asserts or reports a finding/claim |
| `HAS_EVIDENCE` | Dotted | `#94A3B8` (Gray) | Directed | Claim is grounded in a specific chunk passage |
| `USES_METHOD` | Solid | `#0891B2` (Cyan) | Directed | Work utilizes or extends a method/model |
| `EVALUATED_ON` | Solid | `#D97706` (Amber) | Directed | Work benchmarks against a dataset |
| `SUPPORTS` | Solid (2.5px) | `#059669` (Emerald) | Directed | Empirical or logical support between claims |
| `CONTRADICTS` | Solid (3.5px) | `#DC2626` (Red) | Bidirectional | Conflicting empirical conclusions |
| `QUALIFIES` | Dashed | `#EA580C` (Orange) | Directed | Claim limits conditions or assumptions of another |
| `EXTENDS` | Dashed | `#7C3AED` (Purple) | Directed | Builds upon or generalizes earlier finding |
| `DISCUSSES` | Dotted | `#64748B` (Slate) | Directed | Paper contextualizes a general topic |
| `AI_PROPOSED` | Dashed | `#9333EA` (Violet) | Directed | AI-generated hypothesis awaiting human review |

---

## 3. Database Schema & Indexing

The graph subsystem is implemented directly on top of PostgreSQL using **Spring Boot JDBC (`JdbcTemplate`)** without JPA or ORM overhead.

### Traversal Tables Used
1. `papers`: Core paper metadata and ownership (`id`, `owner_id`, `title`, `publication_year`, `visibility`).
2. `paper_references`: Bibliographic citations (`source_paper_id`, `cited_paper_id`, `cited_title`, `raw_reference_text`).
3. `paper_authors` & `authors`: Author relationships and ordering.
4. `concepts` & `paper_concepts`: Topic, method, and dataset relationships (`concept_type`, `relation_type`, `confidence`).
5. `claims`: Extracted atomic claims (`normalized_text`, `source_text`, `provenance_type`, `extraction_confidence`).
6. `claim_relations`: Directed cross-claim relationships (`source_claim_id`, `target_claim_id`, `relation_type`, `confidence`, `rationale`, `review_status`).
7. `claim_relation_evidence`: Many-to-many junction attaching verbatim `document_chunks` to claim relationships.

### High-Performance Graph Indexes (Added via Flyway V3)
```sql
CREATE INDEX idx_paper_references_source_cited ON paper_references(source_paper_id, cited_paper_id);
CREATE INDEX idx_collection_papers_coll_paper ON collection_papers(collection_id, paper_id);
CREATE INDEX idx_paper_authors_paper_author ON paper_authors(paper_id, author_id);
CREATE INDEX idx_papers_pub_year ON papers(publication_year);
CREATE INDEX idx_claim_concepts_claim_concept ON claim_concepts(claim_id, concept_id);
CREATE INDEX idx_paper_concepts_paper_concept ON paper_concepts(paper_id, concept_id);
CREATE INDEX idx_claim_relations_source_target ON claim_relations(source_claim_id, target_claim_id);
CREATE INDEX idx_claim_relation_evidence_rel_chunk ON claim_relation_evidence(claim_relation_id, evidence_chunk_id);
CREATE INDEX idx_claims_provenance_review ON claims(provenance_type);
CREATE INDEX idx_claim_relations_prov_review ON claim_relations(provenance_type, review_status);
```

---

## 4. REST API Specification

### 1. `GET /api/v1/graphs/citations`
Retrieves the citation network for the authenticated user's accessible corpus.
* **Query Parameters**:
  * `collectionId` (UUID, optional): Filter by user collection.
  * `paperId` (UUID, optional): Filter by root paper.
  * `yearFrom` (int, optional): Earliest publication year.
  * `yearTo` (int, optional): Latest publication year.
  * `author` (string, optional): Author name filter.
  * `importedOnly` (boolean, optional): Exclude unresolved external bibliographic nodes.
  * `depth` (int, optional, 1-3): Hop depth.
  * `query` (string, optional): Search keyword.
  * `limit` (int, optional, default: 100, max: 200).

### 2. `GET /api/v1/graphs/citations/{paperId}/neighborhood`
Returns an N-hop citation subgraph around a specific research paper.

### 3. `GET /api/v1/graphs/concepts`
Retrieves the multi-entity concept and claim evidence graph.
* **Query Parameters**:
  * `collectionId`, `paperId`, `claimId`: Scope filters.
  * `nodeTypes`: Comma-separated list (`PAPER,CONCEPT,CLAIM,METHOD,DATASET,CHUNK`).
  * `relationshipTypes`: Comma-separated list (`SUPPORTS,CONTRADICTS,QUALIFIES,EXTENDS`).
  * `provenanceTypes`: Comma-separated list (`REPORTED_IN_PAPER,AI_INTERPRETATION,USER_ASSERTED,HUMAN_REVIEWED`).
  * `reviewStatus`: Comma-separated list (`CONFIRMED,PENDING,REJECTED`).
  * `showEvidenceChunks` (boolean): Whether to include raw document chunk nodes.
  * `limit` (int, default: 100).

### 4. `GET /api/v1/graphs/claims/{claimId}/neighborhood`
Returns a focused subgraph around a specific research claim, its parent paper, its grounded source passage, and all supporting/contradicting claims.

### 5. `GET /api/v1/graphs/nodes/{nodeId}`
Inspects detailed metadata, connected edges, and grounded evidence snippets for a specific node (e.g. `paper:uuid`, `claim:uuid`, `concept:uuid`).

### 6. `GET /api/v1/graphs/edges/{edgeId}`
Inspects relationship rationale, confidence score, reviewer status, and linked evidence chunks for a specific edge (e.g. `rel:uuid`).

---

## 5. Security & Ownership Rules
1. **Multi-Tenant Ownership**: A user can only inspect papers where `p.owner_id = principal.getId() OR p.visibility = 'PUBLIC'`.
2. **Protected Passages**: Raw PDF document chunks are never exposed unless the user has authorized access to the source paper.
3. **Audit Trail**: Rejected AI-proposed relationships are filtered out by default to prevent disinformation, unless explicitly queried by an authorized reviewer.
4. **Parameter Sanitization**: All queries use parameterized SQL via `JdbcTemplate` to guarantee protection against SQL injection.

