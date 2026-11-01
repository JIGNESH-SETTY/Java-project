# AI Research Discovery Engine — Database Setup & Connection Guide

This guide walks you through connecting, configuring, and verifying the **PostgreSQL 16** database with `pgvector` for the AI Research Discovery and Evidence Engine.

---

## 1. Quickstart with Docker Compose (Recommended)

The easiest way to run PostgreSQL with all required extensions (`vector`, `uuid-ossp`) is via the included `docker-compose.yml`.

### Start the database container:
```bash
docker compose up -d postgres
```

### Check container status:
```bash
docker compose ps
```
The database will be available at:
- **Host**: `localhost`
- **Port**: `5434` (mapped from container `5432` to avoid conflicts with existing local PostgreSQL installations)
- **Database Name**: `airesearch`
- **Username**: `postgres`
- **Password**: `password`

---

## 2. PostgreSQL Configuration Details

### Database Extensions
The engine requires two PostgreSQL extensions, enabled automatically in Flyway migration `V1__init_schema.sql`:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
```

### Graph Performance Indexes (Flyway V3)
Flyway migration `V3__add_graph_indexes.sql` creates B-Tree indexes that optimize graph traversal performance for large citation networks and multi-hop entity graphs:

```sql
-- Citation network traversal indexes
CREATE INDEX IF NOT EXISTS idx_paper_refs_source_cited ON paper_references (source_paper_id, cited_paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_refs_cited_source ON paper_references (cited_paper_id, source_paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_refs_cited_title  ON paper_references (cited_title);

-- Claim and evidence relationship traversal indexes
CREATE INDEX IF NOT EXISTS idx_claim_rel_source        ON claim_relations (source_claim_id, target_claim_id);
CREATE INDEX IF NOT EXISTS idx_claim_rel_target        ON claim_relations (target_claim_id, source_claim_id);
CREATE INDEX IF NOT EXISTS idx_claims_paper_id         ON claims (paper_id);
CREATE INDEX IF NOT EXISTS idx_chunks_paper_id         ON chunks (paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_entities_paper_id ON paper_entities (paper_id);
CREATE INDEX IF NOT EXISTS idx_paper_entities_entity_id ON paper_entities (entity_id);
```

---

## 3. Connecting Spring Boot Locally

If you run the Spring Boot backend directly on your host machine (outside Docker), set the following environment variables or add them to your `backend/.env` file:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/airesearch
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=password
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver

# AI Provider Configuration (Options: MOCK, GEMINI, OPENAI, ANTHROPIC, OLLAMA)
AI_PROVIDER=MOCK
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
```

When Spring Boot boots up, Flyway will automatically run all unapplied migrations:
```text
INFO: Flyway Community Edition 10.18.2 by Redgate
INFO: Database: jdbc:postgresql://localhost:5434/airesearch (PostgreSQL 16.4)
INFO: Successfully applied 3 migrations to schema 'public'
INFO: Current version of schema 'public': 3
```

---

## 4. Verifying the Database and Migrations

### Verify using `psql` in Docker:
```bash
docker exec -it airesearch-postgres psql -U postgres -d airesearch
```

Run these SQL queries to verify table schemas and indexes:
```sql
-- 1. Check Flyway Migration History
SELECT installed_rank, version, description, success FROM flyway_schema_history ORDER BY installed_rank;

-- 2. Check Paper Count
SELECT count(*) FROM papers;

-- 3. Check Citation References
SELECT count(*) FROM paper_references;

-- 4. Check Claim Relationships
SELECT relationship_type, provenance_source, count(*) 
FROM claim_relations 
GROUP BY relationship_type, provenance_source;
```

---

## 5. Testing the Graph REST Endpoints

### 1. Register or Authenticate a User
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airesearch.edu","password":"Password123!"}'
```
Copy the `accessToken` from the JSON response.

### 2. Fetch the Citation Graph
```bash
curl -X GET "http://localhost:8080/api/v1/graphs/citations?maxDepth=2&includeExternal=true" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 3. Fetch the Concept & Claim Evidence Graph
```bash
curl -X GET "http://localhost:8080/api/v1/graphs/concepts?includeChunks=true" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 4. Fetch Node Details
```bash
curl -X GET "http://localhost:8080/api/v1/graphs/nodes/paper:1" \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

---

## 6. Troubleshooting Common Issues

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| `Connection refused: localhost:5434` | Postgres container not running | Run `docker compose up -d postgres` and check `docker compose logs postgres`. |
| `Port 5434 already in use` | Another service is using port 5434 | Edit `docker-compose.yml` to change `"5434:5432"` to another port (e.g. `"5435:5432"`), and update `SPRING_DATASOURCE_URL`. |
| `type "vector" does not exist` | pgvector extension missing | Ensure you are using `pgvector/pgvector:pg16` Docker image as defined in `docker-compose.yml`. |
| `401 Unauthorized` on Graph APIs | Missing or expired JWT token | Send `POST /api/v1/auth/login` to obtain a fresh token and pass it as `Authorization: Bearer <token>`. |
| `Checksum mismatch in Flyway` | Modified migration file after apply | Run `mvn flyway:repair` or drop and recreate the development database container (`docker compose down -v && docker compose up -d`). |

