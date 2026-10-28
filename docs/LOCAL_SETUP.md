# Local Setup & Developer Guide

This guide provides instructions for setting up and running the **AI Research Discovery and Evidence Engine** locally on Windows, macOS, or Linux.

---

## 1. System Prerequisites

| Tool | Recommended Version | Verification Command |
| :--- | :--- | :--- |
| **Java JDK** | Java 21 (LTS) | `java -version` |
| **Apache Maven** | 3.9+ | `mvn -version` |
| **Node.js** | 20+ (LTS) | `node -v` |
| **npm** | 10+ | `npm -v` |
| **Docker & Compose** | 24+ *(Optional for containerized mode)* | `docker --version` |
| **Ollama** | Latest *(Optional for local LLMs)* | `ollama --version` |

---

## 2. Default Seed Accounts

The system automatically initializes test accounts upon first startup:

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@airesearch.edu` | `admin123` | `ROLE_ADMIN` |
| **Student Researcher** | `student@airesearch.edu` | `student123` | `ROLE_USER` |

Four seminal foundational papers are pre-seeded in the database:
1. *Attention Is All You Need* (Vaswani et al., 2017)
2. *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks* (Lewis et al., 2020)
3. *Lost in the Middle: How Language Models Use Long Contexts* (Liu et al., 2023)
4. *BERT: Pre-training of Deep Bidirectional Transformers* (Devlin et al., 2018)

---

## 3. Option A: Fast Local Development (Recommended)

Run the PostgreSQL + pgvector database in Docker, while running the Spring Boot backend and Vite frontend natively for rapid development.

### Step 1: Start PostgreSQL with pgvector
```bash
# From the project root:
docker compose up -d postgres
```

### Step 2: Run the Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
The backend initializes the Flyway migrations, executes the seed script, and starts on `http://localhost:8080`.
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

### Step 3: Run the Vite Frontend
Open a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```
The frontend dev server launches at `http://localhost:5173` with full API proxying to port `8080`.

---

## 4. Option B: Full Docker Compose Environment

To run the entire system (Database, Backend, Frontend, and optional Ollama service) in isolated containers:

```bash
# Build and start all services
docker compose up --build -d

# Check running status
docker compose ps
```

Services will be accessible at:
- **Web Application**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080`
- **Postgres Database**: `localhost:5432`

To stop the containers:
```bash
docker compose down
```

---

## 5. Option C: Zero-Docker In-Memory Test Mode

If Docker is not installed on your system, you can run all automated tests using the in-memory H2 database profile:

```bash
cd backend
mvn clean test
```
All unit tests, integration tests, claim ontology verifications, and hybrid ranking algorithms will run against an in-memory SQL schema with mathematical cosine calculations.

---

## 6. Configuring Local AI with Ollama (Optional)

The application ships with a **Deterministic Mock AI Provider** active by default (`APP_AI_PROVIDER=mock`). This ensures you can immediately test PDF uploads, chunking, vector search, comparisons, and reviews without downloading gigabytes of LLM weights.

To switch to a live local LLM using **Ollama**:

### Step 1: Install Ollama
Download and install Ollama from [ollama.com](https://ollama.com).

### Step 2: Pull the Recommended Models
```bash
# Pull the 384-dimensional embedding model
ollama pull all-minilm

# Pull the lightweight chat synthesis model
ollama pull llama3.2
```

### Step 3: Configure Environment Variables
In your shell or in `backend/src/main/resources/application.yml`:
```yaml
app:
  ai:
    provider: ollama
    ollama:
      base-url: http://localhost:11434
      embedding-model: all-minilm
      chat-model: llama3.2
```
Restart the backend. All chunk embeddings and literature reviews will now be powered by your local Ollama models.

---

## 7. Troubleshooting Common Issues

### 1. Database Connection Refused (`localhost:5432`)
- Ensure PostgreSQL is running: `docker compose ps`
- Verify port 5432 is not occupied by a local PostgreSQL installation.

### 2. CORS Errors in Browser
- The backend preconfigures CORS for `http://localhost:5173` and `http://localhost:3000`. If running on a different port, set `cors.allowed-origins` in `application.yml`.

### 3. PDF Upload Size Limit
- By default, uploads are capped at 50MB. Adjust `spring.servlet.multipart.max-file-size` if uploading larger dissertations or books.
