# Production Deployment Guide: AI Research Discovery and Evidence Engine

This guide provides end-to-end instructions for deploying the **AI Research Discovery and Evidence Engine** into production using real scholarly data sources, robust vector storage, scalable cloud object storage, and production-grade AI services.

The design strictly adheres to **evidence-first principles**:
> **Zero Fabrication Policy**: The system never hallucinates, synthesizes, or reports unverified papers, citations, bibliographic metadata, or claims. Every factual output originates from verbatim primary source chunks or is explicitly labeled as an `AI interpretation` or `Proposed relation`.

---

## 1. Deployment Overview

The AI Research Discovery and Evidence Engine is an enterprise-ready scholarly intelligence platform. It ingests academic PDFs, extracts structural aspects and verbatim chunk excerpts, computes dense vector embeddings, maps heterogeneous citation and concept knowledge graphs, and synthesizes evidence-backed literature reviews with audited paragraph-to-chunk provenance.

### Target Deployment Profiles

#### Profile A: Minimum Production Deployment (Low-Cost / Student / MVP)
- **Frontend**: Vercel or Netlify (Global CDN, automatic SSL, SPA rewrite rules).
- **Backend API**: Render, Railway, or Fly.io (Containerized Spring Boot 3 running on Java 21).
- **Database & Vectors**: Neon Serverless PostgreSQL or Supabase with native `pgvector` support.
- **Document Storage**: Cloudflare R2 or AWS S3 (10GB free tier, zero egress fees with R2).
- **AI Services**: Built-in Academic Deterministic AI Engine (offline-safe, zero external API costs) or pay-as-you-go OpenAI-compatible API (`text-embedding-3-small` + `gpt-4o-mini`).
- **Scholarly Data Sources**: Official public APIs (Crossref polite pool, OpenAlex, arXiv, Unpaywall).

#### Profile B: Enhanced Production Deployment (High-Throughput / Institutional)
- **Frontend**: Cloudflare Pages or AWS CloudFront + S3.
- **Backend API**: Multi-instance container cluster behind an application load balancer with horizontal auto-scaling.
- **Database & Vectors**: Managed PostgreSQL (AWS RDS / Aurora or dedicated Supabase instance) with read replicas and pre-warmed HNSW cosine vector indexes.
- **Document Storage**: AWS S3 with KMS server-side encryption, versioning, and presigned time-limited GET/PUT URLs.
- **AI Services**: Private dedicated inference endpoint (vLLM / Ollama with GPU acceleration on a secured private subnet) or dedicated Azure OpenAI instance.
- **Scholarly Data Sources**: OpenAlex Premium API key, Semantic Scholar Partner API, Crossref Plus.

---

## 2. Architecture in Production

```
                                      +------------------------------------+
                                      |         End User Browser           |
                                      +-----------------+------------------+
                                                        |
                                          HTTPS (TLS 1.3)
                                                        |
                     +----------------------------------+----------------------------------+
                     |                                                                     |
                     v                                                                     v
       +----------------------------+                                        +----------------------------+
       |   Vercel / Netlify CDN     |                                        |     API Gateway / Proxy    |
       |  (React 18 SPA Frontend)   |                                        |  (CORS, Rate Limit, Auth)  |
       +----------------------------+                                        +--------------+-------------+
                                                                                            |
                                                                              Reverse Proxy / Ingress
                                                                                            |
                                                                                            v
                                                                             +----------------------------+
                                                                             |   Spring Boot 3.3.4 (JVM)  |
                                                                             |   - JWT Security Filter    |
                                                                             |   - Scholarly Adapters     |
                                                                             |   - Hybrid Search Service  |
                                                                             |   - Asynchronous Jobs      |
                                                                             +-------+------------+-------+
                                                                                     |            |
                                            +----------------------------------------+            +----------------------------------------+
                                            |                                                                                              |
                                            v                                                                                              v
                             +------------------------------+                                                               +------------------------------+
                             |   PostgreSQL 16 + pgvector   |                                                               |   S3 / Cloudflare R2 Bucket  |
                             |  - Flyway Migrations         |                                                               |  - Private Document Storage  |
                             |  - HNSW Vector Indexes       |                                                               |  - Presigned Download URLs   |
                             |  - Pure Spring JDBC Repos    |                                                               |  - SHA-256 Checksums         |
                             +------------------------------+                                                               +------------------------------+
                                            |
                                            +----------------------------------------+
                                            |                                        |
                                            v                                        v
                             +------------------------------+         +------------------------------+
                             |   Scholarly Source APIs      |         |     AI Inference Provider    |
                             |  - Crossref (Polite Mailto)  |         |  - OpenAI-compatible API     |
                             |  - OpenAlex REST v2          |         |  - Self-hosted Ollama (VPC)  |
                             |  - arXiv Export API          |         |  - Mock Deterministic Engine |
                             |  - Unpaywall OA Resolver     |         +------------------------------+
                             |  - Europe PMC / PubMed       |
                             +------------------------------+
```

---

## 3. Prerequisites

Before starting deployment, prepare the following tools and accounts:

1. **Codebase Access**: Clone of this repository containing `/backend`, `/frontend`, `/docker`, and `docker-compose.yml`.
2. **Build Tooling**:
   - Node.js `20.x` LTS or later and `npm` `10.x+`.
   - Docker Engine `24.x+` with Docker Compose v2.
   - Java 21 JDK (required only if building backend natively outside Docker).
3. **Database**: A PostgreSQL 15+ or 16 database with the `vector` extension available (e.g. Neon, Supabase, Render Postgres, Railway).
4. **Cloud Object Storage**: An S3-compatible bucket (Cloudflare R2, AWS S3, or Supabase Storage).
5. **Domain & DNS**: A custom domain name (e.g. `yourdomain.edu`) with access to manage DNS CNAME and A records.
6. **Scholarly Identity**: A valid academic/administrative contact email address for polite-pool API identification (`CROSSREF_MAILTO`, `OPENALEX_MAILTO`, `UNPAYWALL_EMAIL`).

---

## 4. Environment Variables

All sensitive values must be configured via platform secrets. **Never commit `.env` or configuration files containing real credentials to Git.**

### Complete Production Configuration Matrix

| Variable | Type | Required? | Secret? | Default / Example | Purpose & Notes |
|---|---|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | String | Yes | No | `prod` | Activates production Spring Boot profile. |
| `SERVER_PORT` | Integer | Yes | No | `8080` | Internal HTTP listening port for Spring Boot. |
| `APP_BASE_URL` | URL | Yes | No | `https://api.yourdomain.edu` | Canonical public URL of the backend API. |
| `FRONTEND_URL` | URL | Yes | No | `https://app.yourdomain.edu` | Canonical public URL of the React frontend. |
| `DATABASE_URL` | String | Yes | Yes | `jdbc:postgresql://ep-xyz.neon.tech:5432/airesearch` | JDBC connection string. Must start with `jdbc:postgresql://`. |
| `DATABASE_USERNAME` | String | Yes | Yes | `airesearch_user` | Dedicated PostgreSQL application user. |
| `DATABASE_PASSWORD` | String | Yes | Yes | `[SECURE_RANDOM_PASSWORD]` | Strong password (min 24 characters). |
| `DATABASE_SSL_MODE` | String | Yes | No | `require` | Enforces TLS encryption for database transport. |
| `JWT_SECRET` | String | Yes | Yes | `[MIN_32_BYTE_HEX_OR_BASE64]` | HMAC-SHA256 signing secret for authentication tokens. |
| `JWT_ACCESS_TOKEN_EXPIRY_MINUTES` | Integer | No | No | `15` | Short lifetime for stateless access tokens. |
| `JWT_REFRESH_TOKEN_EXPIRY_DAYS` | Integer | No | No | `14` | Lifetime for token refresh sessions. |
| `CORS_ALLOWED_ORIGINS` | String | Yes | No | `https://app.yourdomain.edu` | Comma-delimited list of authorized frontend origins. |
| `STORAGE_PROVIDER` | Enum | Yes | No | `s3` (`local` only for local dev) | Object storage backend (`s3` or `local`). |
| `S3_ENDPOINT` | URL | Conditional | No | `https://[account-id].r2.cloudflarestorage.com` | Custom S3 endpoint (required for Cloudflare R2 / MinIO). |
| `S3_REGION` | String | Yes | No | `auto` (or `us-east-1`, `ap-south-1`) | AWS or R2 storage region. |
| `S3_BUCKET` | String | Yes | No | `airesearch-documents-prod` | Name of private object storage bucket. |
| `S3_ACCESS_KEY` | String | Yes | Yes | `[ACCESS_KEY_ID]` | S3 service credential identifier. |
| `S3_SECRET_KEY` | String | Yes | Yes | `[SECRET_ACCESS_KEY]` | S3 service secret credential. |
| `S3_PUBLIC_BASE_URL` | URL | No | No | `""` | Leave empty to enforce signed private URLs. |
| `AI_PROVIDER` | Enum | Yes | No | `MOCK`, `OPENAI_COMPATIBLE`, `OLLAMA` | Active AI inference service. |
| `AI_BASE_URL` | URL | Conditional | No | `https://api.openai.com/v1` | Base URL for hosted OpenAI-compatible endpoint. |
| `AI_API_KEY` | String | Conditional | Yes | `sk-proj-...` | API authorization key for AI provider. |
| `AI_CHAT_MODEL` | String | Conditional | No | `gpt-4o-mini` | LLM model for aspect extraction and literature synthesis. |
| `AI_EMBEDDING_MODEL` | String | Conditional | No | `text-embedding-3-small` | Dense embedding model (normalized 384-d or 1536-d). |
| `AI_REQUEST_TIMEOUT_SECONDS` | Integer | No | No | `60` | HTTP client timeout for AI inferences. |
| `OLLAMA_BASE_URL` | URL | Conditional | No | `http://ollama-service.internal:11434` | Reusable only if Ollama is running inside same VPC. |
| `OLLAMA_CHAT_MODEL` | String | Conditional | No | `llama3.2` | Local model for chat inference. |
| `OLLAMA_EMBEDDING_MODEL` | String | Conditional | No | `nomic-embed-text` | Local model for vector embeddings. |
| `CROSSREF_MAILTO` | Email | Yes | No | `research-team@yourdomain.edu` | Identifies your traffic for Crossref's Polite Pool. |
| `OPENALEX_MAILTO` | Email | Yes | No | `research-team@yourdomain.edu` | Identifies your traffic for OpenAlex Polite Pool. |
| `OPENALEX_API_KEY` | String | No | Yes | `[OPTIONAL_OPENALEX_KEY]` | Premium rate limit key for OpenAlex. |
| `SEMANTIC_SCHOLAR_API_KEY` | String | No | Yes | `[OPTIONAL_S2_KEY]` | Partner API key for Semantic Scholar citation graph. |
| `UNPAYWALL_EMAIL` | Email | Yes | No | `research-team@yourdomain.edu` | Mandatory email parameter for Unpaywall OA verification. |
| `EUROPE_PMC_API_KEY` | String | No | Yes | `[OPTIONAL_KEY]` | API key for Europe PMC biomedical imports. |
| `MAX_UPLOAD_SIZE_MB` | Integer | No | No | `25` | Maximum PDF file upload size limit. |
| `MAX_PAGES_PER_PDF` | Integer | No | No | `150` | Maximum page count parsed per document. |
| `DOCUMENT_PROCESSING_TIMEOUT_SECONDS` | Integer | No | No | `300` | Ingestion pipeline worker job timeout. |
| `AI_RATE_LIMIT_REQUESTS_PER_MINUTE` | Integer | No | No | `20` | Token bucket limit for AI endpoints per user. |
| `IMPORT_RATE_LIMIT_REQUESTS_PER_MINUTE` | Integer | No | No | `30` | Token bucket limit for external scholarly queries. |
| `LOG_LEVEL` | String | No | No | `INFO` | Root logging level (`INFO`, `WARN`, `DEBUG`). |
| `ACTUATOR_EXPOSED_ENDPOINTS` | String | No | No | `health,info,metrics` | Exposed Spring Boot Actuator endpoints. |

> **Polite Pool Notice**: `CROSSREF_MAILTO`, `OPENALEX_MAILTO`, and `UNPAYWALL_EMAIL` do not require paid subscriptions. Entering a genuine organizational contact email routes your requests to the faster, polite API pools and prevents IP bans.

---

## 5. PostgreSQL and pgvector Setup

The platform uses PostgreSQL 16 with native `pgvector` indexing for dense vector similarity search alongside full-text lexical search (`tsvector`).

### 1. Database Provisioning
Select a provider with built-in `pgvector` support:
- **Neon** (Recommended for serverless): Automatically includes `vector`.
- **Supabase**: Enable the Vector extension in database settings.
- **Render PostgreSQL / Railway**: Select PostgreSQL 15 or 16 and verify `vector` is enabled.

### 2. Enabling pgvector
Connect to your database as an administrator (`postgres` or superuser) and run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

Verify extension installation:
```sql
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

### 3. Flyway Database Migrations
Database migrations are versioned under `backend/src/main/resources/db/migration/`:
- `V1__baseline.sql`: Core tables (`users`, `papers`, `authors`, `paper_authors`, `document_chunks`, `concepts`, `claims`, `claim_relations`, `collections`, `reviews`).
- `V2__scholarly_providers_and_access_links.sql`: Real-data adapter tables (`paper_external_identifiers`, `paper_access_links`).

When the backend container boots with `SPRING_PROFILES_ACTIVE=prod`, Flyway runs automatically, applies pending migrations, and records checksums in `flyway_schema_history`.

### 4. Vector Index Optimization (HNSW)
By default, the platform creates HNSW (Hierarchical Navigable Small World) cosine indexes:
```sql
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
ON document_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```
*Note: If importing a large corpus (>50,000 chunks) in bulk, run `REINDEX TABLE document_chunks;` or `ANALYZE document_chunks;` once the bulk ingestion completes.*

### 5. Connection Pool Recommendations (HikariCP)
Configure HikariCP in `application-prod.yml` or via environment variables:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 15
      minimum-idle: 5
      idle-timeout: 300000
      max-lifetime: 1800000
      connection-timeout: 20000
```

---

## 6. File Storage Setup

Local disk storage (`STORAGE_PROVIDER=local`) is suitable only for single-node development because cloud containers (Render, Railway, Fly.io, Heroku) run on **ephemeral filesystems** that reset upon deployment or scaling.

### Production S3 / Cloudflare R2 Configuration

1. **Create a Private Bucket**:
   - In AWS S3 or Cloudflare R2, create a bucket named `airesearch-documents-prod`.
   - **Disable Public Access**: Block all public read/write access. The bucket must remain 100% private.
2. **Obtain Service Credentials**:
   - Generate an Access Key ID and Secret Access Key with scoped permissions limited to:
     - `s3:GetObject`
     - `s3:PutObject`
     - `s3:DeleteObject`
     - `s3:ListBucket`
3. **Configure Presigned URL Generation**:
   - The backend serves authorized document access via time-limited HMAC presigned URLs (default TTL: 15 minutes).
   - The frontend never receives bucket access keys or raw bucket permissions.

---

## 7. AI Provider Setup

The application features a pluggable AI architecture behind the `AiService` interface.

### Option A: Hosted OpenAI-Compatible Provider (Recommended for Cloud)
Provides zero-maintenance inference with high uptime:
```dotenv
AI_PROVIDER=OPENAI_COMPATIBLE
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=sk-proj-your-api-key
AI_CHAT_MODEL=gpt-4o-mini
AI_EMBEDDING_MODEL=text-embedding-3-small
AI_REQUEST_TIMEOUT_SECONDS=60
```
*Also compatible with Azure OpenAI, Groq, DeepSeek, or Anyscale by setting `AI_BASE_URL`.*

### Option B: Self-Hosted Ollama (Advanced / Private VPC)
If deploying Ollama locally or on a private compute instance:
- **Networking Requirement**: Cloud backends cannot connect to `http://localhost:11434`. You must deploy Ollama on a machine with a public HTTPS endpoint or within the same private VPC/overlay network (e.g. Railway private networking, Fly.io `.internal` DNS, or Docker network).
- **Hardware Requirement**: Minimum 16GB RAM for CPU inference, or 8GB VRAM (NVIDIA T4 / A10G) for GPU acceleration.
- **Model Commands**:
  ```bash
  ollama pull nomic-embed-text
  ollama pull llama3.2
  ```
- **Configuration**:
  ```dotenv
  AI_PROVIDER=OLLAMA
  OLLAMA_BASE_URL=http://ollama-service.internal:11434
  OLLAMA_CHAT_MODEL=llama3.2
  OLLAMA_EMBEDDING_MODEL=nomic-embed-text
  ```

### Graceful AI Degradation
If AI credentials are missing or the provider endpoint is temporarily unreachable:
- Full-text lexical search (`tsvector`), library browsing, PDF viewing, and scholarly metadata imports **continue to function normally**.
- AI-driven features (semantic search, claim relations, RAG review synthesis) display a non-blocking banner: `AI service not configured or unavailable`.

---

## 8. Real Scholarly Data Source Setup

The system integrates directly with official scholarly APIs and legal open-access repositories via the `ScholarlySourceProvider` architecture:

| Provider | Purpose | Authentication | Rate Limits & Quotas | Official Documentation |
|---|---|---|---|---|
| **Crossref** | Canonical DOI resolution, bibliographic metadata | Email in `User-Agent` / polite pool (`CROSSREF_MAILTO`) | 50 req/sec in polite pool | [Crossref REST API](https://api.crossref.org) |
| **OpenAlex** | Works, authors, concepts, citation counts, OA URLs | Email in mailto (`OPENALEX_MAILTO`), optional API key | 100,000 req/day (polite pool) | [OpenAlex Documentation](https://docs.openalex.org) |
| **arXiv** | Preprint search, metadata, legal PDF downloads | No key required | 1 req/3 sec recommended | [arXiv API User Manual](https://info.arxiv.org/help/api/) |
| **Semantic Scholar** | Citation enrichment, connected papers | API key recommended (`SEMANTIC_SCHOLAR_API_KEY`) | 1 req/sec without key, 100 req/sec with partner key | [Semantic Scholar API](https://www.semanticscholar.org/product/api) |
| **Unpaywall** | Legal open-access PDF locator by DOI | Email parameter (`UNPAYWALL_EMAIL`) | 100,000 req/day | [Unpaywall API](https://unpaywall.org/products/api) |
| **Europe PMC** | Biomedical literature & PMC full-text links | Optional key (`EUROPE_PMC_API_KEY`) | 10 req/sec | [Europe PMC RESTful API](https://europepmc.org/RestfulWebService) |

### Legal & Ethical Compliance Rules
1. **No Web Scraping**: The platform never scrapes protected commercial publisher web pages (ScienceDirect, IEEE Xplore, SpringerLink, Wiley, etc.).
2. **No Paywall Bypassing**: If a paper is not legally available via verified Open Access (Unpaywall, OpenAlex `oa_url`, or arXiv), the engine imports canonical bibliographic metadata only (`accessStatus = METADATA_ONLY`) and prompts the user for manual authorized PDF upload.
3. **Attribution Preservation**: Every imported record stores its provider provenance in `paper_external_identifiers` and attributes sources in the UI.

---

## 9. Backend Deployment

### Option A: Render / Railway / Fly.io (Container Deployment)

1. **Create a Web Service**: Link your GitHub repository.
2. **Build Settings**:
   - Runtime: `Docker`
   - Dockerfile path: `./docker/Dockerfile.backend` (or root Dockerfile)
   - Context: Project root
3. **Add Environment Variables**: Paste all variables from Section 4 into the platform's Environment Secrets console.
4. **Health Check Path**: `/actuator/health`
5. **JVM Memory Optimization**: Add to your environment variables:
   ```dotenv
   JAVA_TOOL_OPTIONS=-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError
   ```

### Option B: VPS Deployment (Ubuntu 22.04 / 24.04 with Docker Compose)

1. **Provision VPS**: (e.g. Hetzner, DigitalOcean, Linode with min. 4GB RAM).
2. **Install Docker and Docker Compose**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   ```
3. **Clone Repository and Configure `.env`**:
   ```bash
   git clone https://github.com/your-org/ai-research-discovery.git
   cd ai-research-discovery
   cp .env.example .env
   nano .env # Populate with production secrets
   ```
4. **Launch Application Stack**:
   ```bash
   docker compose -f docker-compose.yml up -d --build
   ```
5. **Setup Nginx Reverse Proxy with Let's Encrypt**:
   ```nginx
   server {
       server_name api.yourdomain.edu;

       location / {
           proxy_pass http://localhost:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           client_max_body_size 30M;
       }
   }
   ```
   Generate SSL with Certbot:
   ```bash
   sudo certbot --nginx -d api.yourdomain.edu
   ```

---

## 10. Frontend Deployment

### Deploying to Vercel

1. **Import Project**: In Vercel Dashboard, import the Git repository.
2. **Root Directory**: Select `frontend`.
3. **Framework Preset**: `Vite`.
4. **Build Command**: `npm run build`.
5. **Output Directory**: `dist`.
6. **Environment Variables**:
   ```dotenv
   VITE_API_BASE_URL=https://api.yourdomain.edu/api/v1
   ```
7. **SPA Routing Configuration**: Ensure `vercel.json` exists in `frontend/`:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

### Deploying to Netlify

1. Link repository and set base directory to `frontend`.
2. Build command: `npm run build`.
3. Publish directory: `frontend/dist`.
4. Create `frontend/public/_redirects`:
   ```text
   /*    /index.html   200
   ```
5. Set `VITE_API_BASE_URL=https://api.yourdomain.edu/api/v1`.

---

## 11. CORS and Domain Configuration

To prevent browser cross-origin blocking while securing API access:

1. **Set Backend CORS Allowed Origins**:
   ```dotenv
   CORS_ALLOWED_ORIGINS=https://app.yourdomain.edu
   ```
2. **Verify Headers in Browser Network Tab**:
   Responses from `api.yourdomain.edu` will include:
   ```http
   Access-Control-Allow-Origin: https://app.yourdomain.edu
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Authorization, Content-Type, Accept
   Access-Control-Allow-Credentials: true
   ```
3. **DNS Records**:
   - `app.yourdomain.edu` -> CNAME to Vercel/Netlify (`cname.vercel-dns.com`).
   - `api.yourdomain.edu` -> A record to VPS IP or CNAME to Render/Railway.

---

## 12. Database Migration Procedure

Flyway handles schema migrations safely during application lifecycle.

1. **Creating New Migrations**:
   - Always create forward-only migration scripts named `V<version>__<description>.sql` in `backend/src/main/resources/db/migration/`.
   - Never alter or delete an existing migration file that has already run in production.
2. **Pre-Deployment Migration Check**:
   Before updating production containers, run the migration locally or in staging:
   ```bash
   docker compose run --rm backend java -jar app.jar --spring.flyway.dry-run-output=true
   ```
3. **Handling Failed Migrations**:
   If a migration fails due to database lock or network glitch:
   ```sql
   -- Inspect failed migration
   SELECT * FROM flyway_schema_history WHERE success = false;
   -- Fix root cause, then repair baseline checksums
   DELETE FROM flyway_schema_history WHERE success = false;
   ```

---

## 13. Secure Secrets Management

Follow these security controls:
1. **Never Commit Secrets**: Ensure `.gitignore` includes:
   ```gitignore
   .env
   .env.*
   *.pem
   *.key
   credentials.json
   ```
2. **Inject Secrets via Environment Variables**: Use platform-native secret vaults (Vercel Environment Variables, Render Secret Groups, Railway Variables, AWS Secrets Manager).
3. **Frontend Isolation**: Do not prefix external API keys with `VITE_`. Any key prefixed with `VITE_` is compiled into the public client bundle and exposed to all visitors.
4. **Token Security**:
   - Generate `JWT_SECRET` with high entropy:
     ```bash
     openssl rand -base64 48
     ```
   - Store access tokens in memory or short-lived secure cookies.

---

## 14. Health Checks and Monitoring

Spring Boot Actuator exposes health and diagnostic endpoints for uptime monitors:

- **Liveness & Readiness**:
  ```http
  GET /actuator/health
  ```
  Returns `{"status": "UP", "components": {"db": {"status": "UP"}, "diskSpace": {"status": "UP"}}}`.
- **Metrics**:
  ```http
  GET /actuator/metrics
  ```
- **Error Tracking**: To integrate Sentry, supply `SENTRY_DSN` in environment variables.
- **Log Sanitization**: Passwords, JWT tokens, and private document chunks are automatically stripped from log outputs.

---

## 15. Background Job Processing

Ingesting academic papers (PDF parsing, text chunking, embedding generation, aspect classification) is computationally intensive and processed asynchronously:

1. **Job Lifecycle**:
   - `PENDING` -> Ingestion job registered in PostgreSQL.
   - `PARSING` -> Apache PDFBox extracts text, layout structures, and page markers.
   - `CHUNKING` -> Sliding window chunker creates ~500-token sections with 10% overlap.
   - `EMBEDDING` -> Generates normalized 384-d dense vectors.
   - `EXTRACTING_ASPECTS` -> Classifies claims, methods, datasets, and limitations.
   - `COMPLETED` -> Paper becomes available in search and matrix views.
   - `FAILED` -> Stores error stack in `ingestion_jobs.error_message`.
2. **Idempotency**: Every job has a unique UUID and can be re-run safely without creating duplicate chunks or relations.
3. **Scaling Beyond Single-Node**:
   For high-volume multi-worker deployments, replace the default Spring `@Async` thread pool with a Redis-backed queue or RabbitMQ worker cluster.

---

## 16. Cost and Rate-Limit Considerations

### Estimated Monthly Operating Costs

| Tier | Services | Estimated Monthly Cost |
|---|---|---|
| **Free / Student MVP** | Vercel (Free) + Render (Free/Hobby $7) + Neon (Free 0.5GB) + Cloudflare R2 (Free 10GB) + Mock AI / Free Ollama | **$0 – $7 / month** |
| **Production Starter** | Vercel Pro ($20) + Railway Backend ($10) + Supabase Pro ($25) + R2 ($5) + OpenAI API (~$15 for ~500 papers) | **$60 – $75 / month** |
| **Enterprise / Campus** | AWS ECS / EKS + Aurora Serverless pgvector + S3 + Dedicated vLLM GPU instance | **$250 – $500+ / month** |

### Rate Limiting Policies
- Protect external API quotas by enforcing token bucket limits per authenticated user:
  - External scholarly searches: 30 requests / minute.
  - LLM synthesis requests: 20 requests / minute.

---

## 17. Production Testing Checklist

Before opening the platform to end users, verify:

- [ ] All database connections use SSL (`sslmode=require`).
- [ ] Flyway migrations `V1` and `V2` are applied.
- [ ] S3 bucket is private and presigned URLs expire within 15 minutes.
- [ ] CORS is restricted strictly to your frontend domain.
- [ ] No secrets are logged or exposed in client bundles.
- [ ] Default passwords for `admin@airesearch.edu` and `student@airesearch.edu` are changed in production.
- [ ] Search works in both semantic (vector) and lexical (full-text) modes.
- [ ] All 6 scholarly source providers respond with valid metadata.

---

## 18. Troubleshooting

### Problem: `ERROR: type "vector" does not exist`
- **Cause**: The `pgvector` extension has not been enabled in the target PostgreSQL database.
- **Resolution**: Connect with superuser credentials and execute `CREATE EXTENSION IF NOT EXISTS vector;`.

### Problem: CORS Error in Browser Console
- **Cause**: `CORS_ALLOWED_ORIGINS` does not match the exact frontend URL (including protocol and port, without trailing slash).
- **Resolution**: Update environment variable to `CORS_ALLOWED_ORIGINS=https://app.yourdomain.edu`.

### Problem: S3 / Cloudflare R2 Returns `403 Forbidden`
- **Cause**: Invalid access credentials or insufficient bucket permissions.
- **Resolution**: Verify `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY`, and `S3_SECRET_KEY`. Ensure IAM policy allows `s3:PutObject` and `s3:GetObject`.

### Problem: Ollama Connection Refused (`http://localhost:11434`)
- **Cause**: A cloud-hosted Spring Boot backend cannot reach `localhost` on your local computer.
- **Resolution**: Deploy Ollama on a server reachable via private network, or switch to `AI_PROVIDER=OPENAI_COMPATIBLE` or `AI_PROVIDER=MOCK`.

### Problem: Out Of Memory (OOM) Kill during Large PDF Parsing
- **Cause**: Parsing a 100+ page PDF exceeded container RAM limit.
- **Resolution**: Set `MAX_PAGES_PER_PDF=100` and increase JVM heap via `-XX:MaxRAMPercentage=75.0`.

---

## 19. Rollback and Backup Strategy

1. **Database Backups**:
   - Enable automated daily snapshots and point-in-time recovery (PITR) in Neon or Supabase.
   - For VPS: Schedule a daily cron job using `pg_dump`:
     ```bash
     pg_dump -Fc -h localhost -U airesearch_user airesearch > /backups/db_$(date +%F).dump
     ```
2. **Document Backups**:
   - Enable object versioning and cross-region replication on your S3 or Cloudflare R2 bucket.
3. **Application Rollback**:
   - Keep previous Docker image tags (`airesearch-backend:v1.0.0`). In Vercel or Railway, click **Instant Rollback** to revert to the previous deployment within seconds.

---

## 20. Post-Deployment Verification (14 Step-by-Step Checks)

Execute these 14 verification steps immediately after deployment:

1. **Verify HTTPS**: Visit `https://app.yourdomain.edu` and confirm a valid SSL certificate is active without browser warnings.
2. **User Registration**: Register a new user account with a valid email.
3. **Authentication & Session**: Log in and verify JWT access and refresh tokens are issued and saved.
4. **DOI Metadata Resolution**: In **Import Paper**, input DOI `10.48550/arXiv.1706.03762` (*Attention Is All You Need*) and verify Crossref/OpenAlex resolves authors, publication year, and abstract.
5. **Preprint Search**: Search query `Retrieval-Augmented Generation` across arXiv and OpenAlex; confirm real scholarly records are returned with source attributions.
6. **Open-Access Document Ingestion**: Import an open-access preprint and confirm the legal PDF link is detected and ingested.
7. **Document Upload**: Upload an authorized sample PDF file and confirm it uploads to S3/R2 storage without error.
8. **Ingestion Lifecycle**: Watch the ingestion status progress from `PENDING` -> `PARSING` -> `CHUNKING` -> `EMBEDDING` -> `COMPLETED`.
9. **Semantic & Hybrid Search**: In **Semantic Search**, submit `transformer self-attention mechanism` and confirm ranked chunk results display match percentages and provenance labels.
10. **Evidence-Grounded Review**: In **Literature Reviews**, enter a research question and generate an evidence-backed synthesis.
11. **Citation Provenance Inspection**: Click on a citation badge in the review output and verify the **Source Chunk Viewer Modal** opens displaying the exact verbatim chunk excerpt.
12. **Authorization Boundary Check**: Verify that private papers belonging to User A cannot be retrieved or inspected by User B.
13. **Health Check**: Send `GET https://api.yourdomain.edu/actuator/health` and verify HTTP 200 with status `UP`.
14. **Audit Log Inspection**: Review production backend logs to ensure no passwords, JWT tokens, S3 secret keys, or raw private documents were logged in plaintext.

---

## Production Safety & Evidence-First Principles

To maintain scientific integrity and regulatory compliance, adhere to these operational commitments:

- **Never Commit Secrets**: Never commit `.env`, API keys, database passwords, JWT secrets, or cloud-storage credentials to version control.
- **Frontend Security**: Never expose provider API keys in the React frontend bundle.
- **Legal Document Access**: Never automatically download papers from paywalled or restricted publisher sites.
- **Authorization Verification**: Only download and process documents the user is authorized to access.
- **Source Attribution**: Clearly attribute imported metadata and open-access links to their original providers (Crossref, OpenAlex, arXiv, Semantic Scholar, Unpaywall, Europe PMC).
- **Provenance Separation**: Never present AI-generated summaries, claim relations, or literature-review synthesis as direct paper findings.
- **Auditable Evidence**: Every factual output generated from papers must include inspectable source evidence.
- **Truthful Incompleteness**: If no source evidence is found, the system must state that it cannot verify the claim.
