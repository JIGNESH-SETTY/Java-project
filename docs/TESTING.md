# Testing Strategy & Verification Guide

This document details the practical testing pyramid, verification procedures, and command-line instructions for the **AI Research Discovery and Evidence Engine**.

---

## 1. Practical Testing Pyramid

```
                / \
               /   \      E2E UI Tests (Playwright)
              /  5  \     - Login, Library, Search, Compare, Review flows
             /-------\
            /         \   API & Controller Tests (MockMvc / Spring Boot)
           /    15+    \  - Auth lifecycle, upload validation, review status
          /-------------\
         /               \ Repository & Schema Tests (Flyway & JDBC)
        /       20+       \ - SQL mappings, cosine queries, cascade deletes
       /-------------------\
      /                     \ Domain & Algorithm Unit Tests (JUnit 5 + Mockito)
     /         30+           \ - Chunking, hybrid ranking, claim validation
    /-------------------------\
```

---

## 2. Test Suites Implemented

### Suite A: Domain & Unit Logic Tests
- **`ChunkingServiceTest.java`**:
  - Tests sliding-window chunking, token estimation, and section boundary detection (`Abstract`, `Methodology`, etc.).
  - Verifies exact character offsets (`char_start`, `char_end`) and page number mapping.
- **`ClaimRelationValidationTest.java`**:
  - Validates that numeric differences alone cannot trigger a `CONTRADICTS` relation.
  - Enforces mandatory rationale string and evidence chunk presence for `CONTRADICTS` and `QUALIFIES`.
- **`HybridSearchRankingTest.java`**:
  - Tests normalization of dense vector cosine similarities and lexical BM25/FTS ranks.
  - Verifies configurable $\alpha$ weighting and reciprocal rank tie-breaking.
- **`LiteratureReviewEvidenceMappingTest.java`**:
  - Verifies that every generated paragraph links to at least one valid chunk ID.
  - Validates that coverage warnings are generated when the corpus contains fewer than 3 relevant papers.

### Suite B: API & Controller Integration Tests
- **`AuthControllerIntegrationTest.java`**:
  - Validates registration with BCrypt hashing.
  - Tests JWT token generation and refresh token rotation in the database.
  - Enforces protected route rejection when token is missing or expired.

### Suite C: End-to-End UI Tests (Playwright)
- **`frontend/e2e/research-engine.spec.ts`**:
  1. Login with seeded credentials and role verification.
  2. Paper library inspection with chunk viewer modal.
  3. Hybrid search query and exact snippet highlighting.
  4. Multi-paper comparison matrix and AI synthesis section.
  5. Claims explorer with distinct provenance badges.
  6. Literature review generation and evidence panel.

---

## 3. Running Backend Tests

Run all unit and integration tests from the `backend/` directory:

```bash
cd backend
mvn clean test
```

### Running a Specific Test Class
```bash
mvn test -Dtest=ClaimRelationValidationTest
```

### Viewing Test Reports
After running tests, reports are available in:
```text
backend/target/surefire-reports/
```

---

## 4. Running Frontend Tests & E2E Suite

### Step 1: Typecheck and Build Validation
```bash
cd frontend
npm run build
```

### Step 2: Run Playwright E2E Tests
Ensure the backend and frontend dev servers are running, then run:

```bash
cd frontend
npx playwright test
```

To run Playwright in interactive UI mode:
```bash
npx playwright test --ui
```

---

## 5. Offline & Deterministic Guarantees

All tests execute completely offline without making external HTTP calls to OpenAI, HuggingFace, or Ollama:
- Embedding queries utilize the `MockAiProvider`, which hashes text into deterministic 384-dimensional coordinates.
- Chat models utilize domain-structured JSON synthesizers with schema validation.
- Database operations in test profiles execute against an in-memory SQL schema with custom cosine distance functions.
