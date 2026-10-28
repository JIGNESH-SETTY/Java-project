# AI & RAG Foundations Guide

This guide is designed for computer science engineering students learning the fundamentals of **Retrieval-Augmented Generation (RAG)**, dense vector representations, hybrid lexical-semantic search, prompt engineering, and non-hallucinatory evidence grounding.

---

## 1. What is RAG and Why Does Scholarly Research Need It?

Large Language Models (LLMs) suffer from two core limitations when applied to scientific literature:
1. **Parametric Knowledge Cutoffs**: The model only knows what was in its training corpus up to its training cutoff date.
2. **Hallucination & Fabrication**: LLMs generate text token-by-token based on probability distributions. When asked for specific numeric benchmarks, citations, or statistical findings, they readily invent plausible-sounding but fictitious DOIs, authors, or experimental results.

**Retrieval-Augmented Generation (RAG)** solves this by separating **storage of truth** from **reasoning capability**:
- The **Vector Database / Document Store** serves as the external long-term memory containing verifiable source papers.
- The **Retriever** finds the exact passages (chunks) relevant to a research question.
- The **Generator (LLM)** receives the retrieved passages as context and synthesizes an answer restricted strictly to that context.

```
                      +----------------------------+
                      |   User Research Question   |
                      +--------------+-------------+
                                     |
                                     v
                       +---------------------------+
                       |    Dense + Lexical Search |
                       +-------------+-------------+
                                     |
              +----------------------+----------------------+
              |                                             |
              v                                             v
    +-------------------+                         +-------------------+
    | Vector Similarity |                         | Full-Text Lexical |
    | (Cosine / <=> )   |                         | (Postgres FTS)    |
    +---------+---------+                         +---------+---------+
              |                                             |
              +----------------------+----------------------+
                                     |
                                     v
                       +---------------------------+
                       |   Reciprocal Rank Fusion  |
                       |    Re-Ranked Top Chunks   |
                       +-------------+-------------+
                                     |
                                     v
                       +---------------------------+
                       | Strict Context-Bounded LLM|
                       |  Prompt with Provenance   |
                       +-------------+-------------+
                                     |
                                     v
                       +---------------------------+
                       | Verified Literature Review|
                       |  with Chunk-Level Citations|
                       +---------------------------+
```

---

## 2. Document Chunking Strategies

Scientific papers cannot be ingested as single monolithic texts because:
- LLMs have finite context windows.
- Semantic vector embeddings dilute their precision when summarizing 10,000 words into a single 384-dimensional vector.

### Chunk Sizing & Overlap
In this engine, documents are segmented using `ChunkingService.java`:
- **Target Chunk Size**: 500 – 900 tokens (approx. 2000–3500 characters).
- **Chunk Overlap**: 80 – 150 tokens (approx. 300–600 characters).
- **Section Boundary Preservation**: Rather than splitting blindly across arbitrary character boundaries, chunking actively identifies section headings (`Abstract`, `Introduction`, `Methodology`, `Experiments`, `Results`, `Limitations`, `Conclusion`).

### Metadata Retention
Every chunk stored in the `document_chunks` table retains:
- `paper_id`: Parent paper UUID.
- `chunk_index`: Sequential integer index.
- `section_name`: Inferred scholarly section.
- `page_number`: Inferred physical page number from PDFBox.
- `char_start` and `char_end`: Exact character offsets in the extracted raw text.
- `content`: Original verbatim text.
- `embedding`: Vector representation (384 dimensions).

---

## 3. Dense Vector Embeddings

An **embedding model** transforms natural language text into a high-dimensional mathematical coordinate vector:

$$\mathbf{v} \in \mathbb{R}^d \quad (\text{where } d = 384 \text{ for } \texttt{all-MiniLM-L6-v2})$$

Texts with similar conceptual meanings reside close to each other in this vector space, even if they use different vocabularies (e.g., *"self-attention mechanism"* and *"scaled dot-product query-key routing"*).

### Cosine Similarity Metric
The distance between two vectors $\mathbf{u}$ and $\mathbf{v}$ is measured using **Cosine Distance**:

$$\text{Cosine Similarity}(\mathbf{u}, \mathbf{v}) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$

In PostgreSQL with `pgvector`, the `<=>` operator computes the **Cosine Distance**:

$$\text{distance} = 1 - \text{Cosine Similarity}$$

---

## 4. Hybrid Search & Reciprocal Rank Fusion (RRF)

Dense vector search is powerful at understanding semantic concepts, but can fail at exact scholarly keyword lookups (e.g., exact dataset names like *"NQ-Open"* or benchmark acronyms like *"ROUGE-L"*). 

Conversely, lexical BM25/FTS search finds exact keywords but misses synonymous phrasing.

### The Solution: Hybrid Ranking
We combine both retrieval mechanisms:
1. **Semantic Channel**: Query vector embedded and searched against `document_chunks.embedding` using `pgvector <=>`.
2. **Lexical Channel**: Query text searched using PostgreSQL Full-Text Search (`to_tsquery('english', ?)` against `tsvector`).

### Fusion Formula
Results from both channels are normalized and combined using a weighted hybrid score:

$$\text{Score}_{\text{hybrid}} = \alpha \cdot \text{Score}_{\text{semantic}} + (1 - \alpha) \cdot \text{Score}_{\text{lexical}}$$

Where $\alpha \in [0.0, 1.0]$ is the configurable semantic weight (default: $0.70$).

---

## 5. Non-Hallucinatory Prompt Engineering

To guarantee scholarly integrity, the prompt templates in `AiService.java` enforce strict guardrails:

```text
You are an evidence-grounded scientific research assistant.
You MUST follow these rules strictly:
1. Base your answer ONLY on the provided context snippets below.
2. Every factual statement must cite its source chunk ID in brackets (e.g. [C-1]).
3. If the provided context does not contain sufficient evidence to answer a question,
   explicitly state: "Not clearly reported in the available text."
4. NEVER invent citations, DOIs, page numbers, authors, or experimental results.
5. Clearly distinguish between what the paper reported vs your synthesis.
```

---

## 6. The 4-Tier Provenance Taxonomy

| Provenance Level | Tag | Meaning |
| :--- | :--- | :--- |
| **Level 1: Reported Evidence** | `REPORTED_IN_PAPER` | Directly extracted from a verbatim chunk with page and character boundaries. |
| **Level 2: AI Interpretation** | `AI_INTERPRETATION` | Inferred synthesis, comparison matrix, or cross-paper relation proposed by the model. |
| **Level 3: User Annotation** | `USER_ANNOTATION` | Notes, critiques, or tags written by the human researcher. |
| **Level 4: User Asserted** | `USER_ASSERTED` | Human-curated or manually confirmed claim relation. |
