# AI Research Discovery and Evidence Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/airesearch/discovery-engine)
[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot 3.3.4](https://img.shields.io/badge/Spring%20Boot-3.3.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![Vite + React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20TypeScript-blue.svg)](https://vitejs.dev/)
[![Glassmorphism UI](https://img.shields.io/badge/Design-Light%20Glassmorphism-indigo.svg)](frontend/src/index.css)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An evidence-backed, non-hallucinatory scholarly knowledge engine built for computer science researchers and academic institutions. This project enables researchers to ingest academic PDFs or import records via official scholarly APIs (Crossref, OpenAlex, arXiv, Semantic Scholar, Unpaywall, Europe PMC), extract structured scientific claims, detect cross-paper contradictions and supporting evidence, explore interactive citation/concept graphs, and generate literature reviews where **every factual sentence is grounded in verbatim chunk citations**.

> **Comprehensive Deployment Guide**: For end-to-end instructions on deploying the application to cloud platforms (Vercel, Render, Railway, Neon, S3/R2) with real AI inference and live scholarly data, see [DEPLOYMENT.md](file:///c:/Users/vinay/Desktop/Java-project/DEPLOYMENT.md).

---

## 1. Problem Statement & Evidence-First Principles

Modern generative AI applications applied to scientific literature suffer from **hallucination, ungrounded extrapolation, and fabricated citations**. When an LLM is asked to summarize a scientific debate, it often invents plausible-sounding authors, papers, and experimental results.

### The Zero-Fabrication Commitment
1. **Never present an AI interpretation as a reported paper fact.**
2. **Never fabricate citations, DOIs, page numbers, authors, or experimental results.**
3. **If evidence is unavailable in the corpus, explicitly say so rather than guessing.**
4. **Distinguish clearly between Reported Evidence, AI Synthesis, and Human Annotations.**
5. **Every factual claim generated links directly to inspectable, primary source chunk text.**

---

## 2. Key Features

- **Academic Light-Theme Glassmorphism UI**: High-contrast, calm frosted glass design system with accessible typography, subtle depth, responsive layout (desktop, tablet, mobile drawer), and strict adherence to `prefers-reduced-motion`.
- **Real-Data Scholarly Import Architecture**: Direct integration with official APIs (Crossref, OpenAlex, arXiv, Semantic Scholar, Unpaywall, Europe PMC) for canonical DOI resolution, preprint retrieval, open-access verification, and automated attribution.
- **Scholarly PDF Ingestion & Semantic Chunking**: Extract text with Apache PDFBox, detect sections (`Abstract`, `Methodology`, `Results`, `Limitations`), compute character offsets and page mappings, and index chunks with 384-dimensional dense vectors.
- **Dense + Lexical Hybrid Search**: Combines PostgreSQL `pgvector` cosine similarity with PostgreSQL Full-Text Search (FTS) using weighted rank fusion.
- **Structured Paper Comparison Matrix**: Compare 2 to 5 papers side-by-side across Research Problem, Methodology, Datasets, Metrics, Findings, and Limitations, with instant click-to-view chunk evidence.
- **Claims & Evidence Tracking**: Extracts atomic scientific claims and tracks directional relationships (`SUPPORTS`, `CONTRADICTS`, `QUALIFIES`, `EXTENDS`, `DISCUSSES`, `DUPLICATES`) with human review actions.
- **Interactive Citation & Concept Graphs**: Visualized using Cytoscape.js with light frosted canvas, interactive physics, floating controls, and persistent provenance legends.
- **Evidence-Backed Literature Reviews**: RAG pipeline generating multi-paragraph reviews with paragraph-to-chunk provenance mappings, coverage warnings, and Markdown/BibTeX export.
- **Offline Deterministic Fallback**: Shipped with a built-in deterministic local Mock AI engine so the entire project can be evaluated, tested, and demonstrated offline without GPU hardware or external API keys.

---

## 3. Real-Data Import Architecture & Limitations

The engine includes provider adapters behind the unified `ScholarlySourceProvider` interface:

```text
User enters DOI, arXiv ID, or search query
  │
  ▼
Query official data source (Crossref, OpenAlex, arXiv, Semantic Scholar, Unpaywall, Europe PMC)
  │
  ▼
Display matching canonical records with source attribution
  │
  ▼
User selects item to import
  │
  ├─► Canonical metadata saved to database (`paper_external_identifiers`)
  │
  └─► Legal Open-Access Check (Unpaywall / OpenAlex `oa_url` / arXiv PDF)
        │
        ├─► [VERIFIED OPEN ACCESS]: Download legal PDF & launch ingestion pipeline
        │
        └─► [RESTRICTED / PAYWALLED]: Save metadata only (`accessStatus = METADATA_ONLY`)
              and offer manual authorized PDF upload
```

### Legal Access Limitations
- **No Web Scraping**: The engine never scrapes commercial publisher web pages (ScienceDirect, IEEE Xplore, SpringerLink, etc.).
- **No Paywall Bypassing**: If a paper is not legally open-access, full-text download is skipped.
- **Rate-Limiting & Polite Pools**: All outgoing requests include genuine contact emails (`CROSSREF_MAILTO`, `OPENALEX_MAILTO`, `UNPAYWALL_EMAIL`) to respect provider quotas and terms of service.

---

## 4. Technology Stack

| Layer | Technologies Selected | Justification |
| :--- | :--- | :--- |
| **Language & Platform** | Java 21 (LTS), OpenJDK | Pattern matching, records, virtual threads, high enterprise adoption. |
| **Backend Framework** | Spring Boot 3.3.4 | Spring Web, Spring Security, Spring Validation, Spring JDBC. |
| **Persistence Layer** | Spring `JdbcTemplate` *(Strictly NO JPA/Hibernate)* | Complete SQL transparency, zero N+1 errors, direct use of `pgvector` operators (`<=>`). |
| **Database & Search** | PostgreSQL 16 + `pgvector` | Native dense vector cosine distance alongside transactional relational integrity. |
| **Migrations** | Flyway 10 | Version-controlled repeatable database schema migrations (`V1` baseline, `V2` scholarly providers). |
| **PDF Processing** | Apache PDFBox 3.0.3 | Robust scholarly text extraction, character offset tracking, and font metadata. |
| **AI Providers** | Offline Mock Provider (Default) / OpenAI-compatible / Ollama | Pluggable AI engine supporting hosted inference, local models, or offline evaluation. |
| **Frontend Framework** | React 19, TypeScript, Vite 8 | Fast HMR, strict type safety, modern component architecture. |
| **Styling & Design** | Vanilla CSS Glassmorphism + Tailwind Tokens, Lucide React | Curated academic light-theme with frosted glass panels, WCAG AA contrast, and badge taxonomy. |
| **State & Graph Visualization** | TanStack Query, React Router, Cytoscape.js | High-performance client caching and interactive graph physics. |
| **Testing** | JUnit 5, Mockito, MockMvc, Playwright | Comprehensive test pyramid covering unit, database, API, and E2E browser flows. |
| **Containerization** | Docker, Docker Compose | Multi-stage Docker builds for backend and frontend with Nginx SPA routing. |

---

## 5. UI Walkthrough & Provenance Taxonomy

The redesigned light-theme interface uses semi-transparent frosted glass panels (`--glass-surface`: `rgba(255, 255, 255, 0.62)`) over a soft multi-radial gradient background, providing an elegant academic atmosphere with strict readability:

### Standardized Provenance Badges
Every piece of information displays an unmistakable origin badge:
- `Reported in paper`: Verbatim or direct excerpt extracted from the source document text.
- `AI interpretation`: Synthesis, categorization, or summary generated by an AI model.
- `User annotation`: Note or highlight contributed by a human researcher.
- `User asserted`: Fact or claim explicitly declared by a verified user.
- `Proposed relation`: Directional claim relation (`SUPPORTS`, `CONTRADICTS`, etc.) proposed by the RAG model.
- `Human reviewed`: Relation or claim verified and approved by an authorized researcher.

---

## 6. Quickstart & Local Setup

### Option 1: Fast Hybrid Local Setup (Recommended)
```bash
# 1. Start the PostgreSQL with pgvector database
docker compose up -d postgres

# 2. Run the Spring Boot Backend (seeds 4 seminal papers automatically)
cd backend
mvn spring-boot:run

# 3. Start the Frontend dev server
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

### Option 2: Full Docker Stack
```bash
docker compose up -d --build
```
- **Frontend**: `http://localhost:3001` (Nginx container)
- **Backend API**: `http://localhost:8080` (Spring Boot)
- **Postgres Database**: `localhost:5434` (mapped port)

### Demo Accounts
- **Admin**: `admin@airesearch.edu` / `admin123`
- **Student**: `student@airesearch.edu` / `student123`

---

## 7. Short Production Deployment Checklist

For complete step-by-step documentation, see [DEPLOYMENT.md](file:///c:/Users/vinay/Desktop/Java-project/DEPLOYMENT.md).

- [ ] **Database**: Provision PostgreSQL 16 on Neon, Supabase, or Railway; enable `CREATE EXTENSION IF NOT EXISTS vector;`.
- [ ] **Storage**: Create a private S3 / Cloudflare R2 bucket with scoped IAM access keys.
- [ ] **AI Configuration**: Set `AI_PROVIDER=OPENAI_COMPATIBLE` with API key and models, or verify fallback is active.
- [ ] **Scholarly APIs**: Set genuine contact email for `CROSSREF_MAILTO`, `OPENALEX_MAILTO`, and `UNPAYWALL_EMAIL`.
- [ ] **Security**: Generate a secure 32+ byte `JWT_SECRET` (`openssl rand -base64 48`).
- [ ] **CORS**: Set `CORS_ALLOWED_ORIGINS` to your frontend production domain.
- [ ] **Backend**: Deploy container to Render, Railway, Fly.io, or VPS using `docker/Dockerfile.backend`.
- [ ] **Frontend**: Deploy `frontend/` to Vercel or Netlify with `VITE_API_BASE_URL`.
- [ ] **Verification**: Execute the 14 post-deployment verification checks in `DEPLOYMENT.md`.

---

## 8. License
This project is open-source and licensed under the [MIT License](LICENSE).
