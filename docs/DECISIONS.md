# Architectural Decision Records (ADR)

This document records the architectural choices, rationale, and trade-offs made during the design of the **AI Research Discovery and Evidence Engine**.

---

## ADR-001: Spring JDBC with `JdbcTemplate` vs. JPA / Hibernate

### Context
In many Java enterprise projects, Spring Data JPA / Hibernate is the default persistence layer. However:
- JPA introduces significant abstraction layers (entity states, dirty checking, lazy loading exceptions, session cache invalidation).
- Specialized SQL extensions like PostgreSQL's `pgvector` (e.g., `<=> ?::vector`) are awkward and difficult to query using JPQL or Criteria API without resorting to native queries.
- For students learning backend engineering, understanding raw SQL queries, transaction boundaries, and prepared statements is more educational and reliable.

### Decision
We use Spring JDBC (`JdbcTemplate`) exclusively. Core persistence contains zero `@Entity`, `@OneToMany`, or Hibernate dependencies.

### Consequences
- **Positive**: Complete control over SQL execution, zero N+1 query issues, transparent use of pgvector distance operators, clean explicit row mappers, and instant execution.
- **Trade-off**: Requires writing explicit SQL statements (`INSERT`, `SELECT`, `UPDATE`) and row mappers for each domain record.

---

## ADR-002: Modular Monolith vs. Distributed Microservices

### Context
A scholarly search system encompasses multiple capabilities: authentication, PDF ingestion, vector indexing, claim relation reasoning, and literature review generation. Distributing these across microservices would introduce:
- Distributed transaction coordination.
- Service discovery and API gateway overhead.
- High Docker memory requirements on a local development machine.

### Decision
We use a **modular monolith** architecture packaged by feature:
```text
com.airesearch.discovery
  ├── auth
  ├── paper
  ├── ingestion
  ├── search
  ├── claims
  ├── comparison
  ├── review
  ├── graph
  ├── annotation
  ├── collection
  ├── ai
  └── shared
```

### Consequences
- **Positive**: Single Spring Boot JAR, local in-memory method calls, ACID transactions during paper ingestion, simple single-command deployment.
- **Trade-off**: Requires discipline to prevent circular cross-package dependencies.

---

## ADR-003: Hybrid Lexical-Semantic Search over Vector-Only Retrieval

### Context
Dense vector search using embedding models (`all-MiniLM-L6-v2`) excels at conceptual similarity. However, scientific literature frequently involves:
- Specific benchmark names (*"WMT 2014"*, *"GLUE"*, *"SQuAD v2.0"*).
- Exact metric abbreviations (*"ROUGE-L"*, *"BLEU-4"*, *"F1"*).
- Specific author names (*"Vaswani"*, *"Lewis"*).
Vector search alone often retrieves topically related papers that lack the exact dataset or benchmark mentioned.

### Decision
We implement a **Hybrid Retrieval** pipeline combining:
1. Dense vector cosine similarity via PostgreSQL `pgvector`.
2. Lexical keyword matching via PostgreSQL Full-Text Search (`tsvector` and `tsquery`).
3. Normalization and weighted rank fusion ($\alpha \cdot \text{Dense} + (1-\alpha) \cdot \text{Lexical}$).

### Consequences
- **Positive**: High precision on exact acronyms combined with high recall on conceptual phrasing.
- **Trade-off**: Requires managing both a vector index and an FTS index on chunk content.

---

## ADR-004: Offline-First Mock AI Fallback by Default

### Context
Students, instructors, and automated CI pipelines evaluating the project may not have access to an NVIDIA GPU or the bandwidth to pull a 4GB LLaMA/Mistral checkpoint via Ollama. If the project failed to run without a live LLM, it would be fragile and difficult to evaluate.

### Decision
We provide a **Deterministic Mock AI Provider** active by default (`APP_AI_PROVIDER=mock`). It computes deterministic 384-dimensional vector coordinate projections using semantic n-gram hashing and synthesizes structured domain responses for paper comparisons, claim extractions, and literature reviews. The application switches to Ollama with a single configuration flag (`APP_AI_PROVIDER=ollama`).

### Consequences
- **Positive**: The entire application runs out-of-the-box in seconds with zero setup friction and passes all automated tests.
- **Trade-off**: Mock text syntheses are rule-guided and deterministic rather than generative prose.

---

## ADR-005: Four-Tier Evidence Provenance Model

### Context
Existing commercial AI search engines frequently blur the boundary between factual quotations from a study and hallucinated model summaries. In academic research, presenting a model-generated conjecture as a paper's reported benchmark is unacceptable.

### Decision
Every claim, comparison cell, and review paragraph is tagged with one of four provenance levels:
1. `REPORTED_IN_PAPER`: Directly extracted from verbatim text with exact chunk and page coordinates.
2. `AI_INTERPRETATION`: Proposed relationship, synthesis, or pattern inferred by the model.
3. `USER_ANNOTATION`: Critique or note written by a human.
4. `USER_ASSERTED`: Relationship confirmed by human review.

### Consequences
- **Positive**: Unmistakable visual badges in the frontend; complete transparency on what is verifiable empirical evidence versus model interpretation.
