# Claim & Evidence Modeling Ontology

This document defines the formal ontology, semantic relations, and validation rules governing the **Claims and Evidence Tracking** subsystem in the AI Research Discovery and Evidence Engine.

---

## 1. What is a Scientific Claim?

A **claim** is an atomic, verifiable proposition asserted within a scientific paper or proposed by a researcher. Examples:
- *"Self-attention achieves a BLEU score of 28.4 on WMT 2014 English-to-German translation."*
- *"Dense passage retrieval outperforms BM25 on the Natural Questions benchmark."*
- *"Large language models suffer from degradation in reasoning when key information is located in the middle of long contexts."*

In this application, claims are treated as first-class citizens rather than unstructured text.

---

## 2. Claim Classification Schema

Every extracted claim is assigned a `ClaimType`:

| Claim Type | Description | Example |
| :--- | :--- | :--- |
| `FINDING` | An empirical or experimental result observed in the study. | *"Transformer model reached state-of-the-art BLEU of 41.8 on English-to-French."* |
| `HYPOTHESIS` | A testable scientific conjecture or proposition under investigation. | *"Contextual embeddings encode hierarchical syntactic structure without recurrence."* |
| `METHOD_ASSERTION` | A statement describing algorithmic design, architectural choices, or loss formulation. | *"Multi-head attention allows the model to jointly attend to information from different representation subspaces."* |
| `LIMITATION` | A boundary, failure mode, or computational bottleneck identified by the authors. | *"Self-attention computes $O(n^2)$ pairwise dot products, becoming prohibitive for long sequences."* |
| `DATASET_ASSERTION` | A factual assertion concerning data splits, annotation quality, or distributions. | *"The test set comprises 3,610 curated human-written question-answer pairs."* |
| `BACKGROUND` | A contextual or preliminary assertion citing prior baseline literature. | *"Recurrent neural networks compute hidden states sequentially, precluding parallelization."* |

---

## 3. Claim Relation Taxonomy

When comparing claims across different publications, the engine establishes directed or bidirectional semantic links (`RelationType`):

```
       [Source Claim: Paper A]
                  |
                  |--- SUPPORTS ---> [Target Claim: Paper B]
                  |--- CONTRADICTS -> [Target Claim: Paper B]
                  |--- QUALIFIES ---> [Target Claim: Paper B]
                  |--- EXTENDS -----> [Target Claim: Paper B]
                  |--- DISCUSSES ---> [Target Claim: Paper B]
                  |--- DUPLICATES --> [Target Claim: Paper B]
                  v
       [Target Claim: Paper B]
```

### 1. `SUPPORTS`
- **Definition**: The experimental findings or methodology in Paper A corroborate, validate, or replicate the finding in Paper B.
- **Criteria**: Both studies must evaluate under comparable tasks, datasets, or theoretical assumptions, yielding aligned conclusions.

### 2. `CONTRADICTS`
- **Definition**: The findings of Paper A are in direct conflict with Paper B under identical or equivalent conditions.
- **Critical Rule**: **Numeric divergence alone does NOT constitute a contradiction**. If Paper A reports 82% F1 on BioASQ and Paper B reports 74% F1 on SQuAD, they evaluate different distributions. A contradiction requires:
  1. Identical or statistically equivalent task formulation.
  2. Aligned or comparable evaluation metrics.
  3. Divergent empirical conclusions or mutually exclusive causal claims.
  4. Mandatory textual **rationale** explaining why the contradiction is real.

### 3. `QUALIFIES`
- **Definition**: Paper A demonstrates that the claim in Paper B holds only under specific constraints, subsets, or parameter ranges.
- **Example**: Paper B claims *"Retrieval always boosts LLM accuracy"*, while Paper A qualifies: *"Retrieval boosts accuracy only when retrieved passages exceed a precision threshold of 0.65, otherwise inducing distractors."*

### 4. `EXTENDS`
- **Definition**: Paper A takes the concept, architecture, or benchmark of Paper B and adapts it to a broader domain, multimodal setting, or higher efficiency regime.

### 5. `DISCUSSES`
- **Definition**: Paper A references or contextualizes Paper B without providing conclusive replication or refutation.

### 6. `DUPLICATES`
- **Definition**: Both claims express identical semantic assertions (useful for clustering overlapping findings across citations).

---

## 4. Provenance & Human-in-the-Loop Review Lifecycle

To prevent synthetic AI assumptions from corrupting scholarly knowledge, all relations adhere to a two-phase lifecycle:

```
  [Model Ingestion & Aspect Extraction]
                  |
                  v
  [AI Proposes Relation: AI_INTERPRETATION, PENDING]
                  |
                  +-----------------------------------+
                  |                                   |
                  v                                   v
  [User Action: CONFIRMED]            [User Action: REJECTED]
  Status -> CONFIRMED                 Status -> REJECTED
  Provenance -> USER_ASSERTED         Provenance -> USER_ASSERTED
  Audit Trail Updated                 Reason Logged
```

### Review States (`ReviewStatus`)
1. **`PENDING`**: Proposed by the local/Ollama AI extraction service. Rendered in the UI with a distinct dashed purple border and an *"AI Interpretation"* badge.
2. **`CONFIRMED`**: Inspected and verified by a human researcher. Promoted to *"Human-Reviewed Relation"*.
3. **`REJECTED`**: Rejected by a human researcher due to flawed premise, disparate metrics, or out-of-context extrapolation. Excluded from consensus synthesis.

---

## 5. Relational Schema in PostgreSQL

```sql
-- Claims Table
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paper_id UUID REFERENCES papers(id) ON DELETE CASCADE,
    source_chunk_id UUID REFERENCES document_chunks(id) ON DELETE SET NULL,
    normalized_text TEXT NOT NULL,
    source_text TEXT NOT NULL,
    claim_type VARCHAR(50) NOT NULL,
    provenance_type VARCHAR(50) NOT NULL,
    extraction_confidence REAL NOT NULL DEFAULT 1.0,
    section_name VARCHAR(100),
    page_number INTEGER,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claim Relations Table
CREATE TABLE claim_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    target_claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL,
    confidence REAL NOT NULL DEFAULT 1.0,
    rationale TEXT NOT NULL,
    provenance_type VARCHAR(50) NOT NULL,
    review_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
