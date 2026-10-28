# Security & Reliability Specification

This document details the security architecture, authentication mechanisms, file-upload defenses, and data-protection controls implemented in the **AI Research Discovery and Evidence Engine**.

---

## 1. Authentication & Session Security

The system employs a dual-token JWT architecture:

```
[Client] --- (Email, Password) ---> [POST /api/v1/auth/login]
[Client] <--- (Access Token: 15m, Refresh Token: 7d) --- [Server]
    |
    |--- [Header: Authorization: Bearer <Access Token>] ---> [Protected API]
    |
    +--- (Token Expired) ---> [POST /api/v1/auth/refresh]
                              - Checks Refresh Token Hash in DB
                              - Checks 'revoked_at' is NULL
                              - Rotates old token -> Issues new pair
```

### Password Hashing
- User passwords are encrypted using **BCrypt** with a computational work factor of 12.
- Plaintext passwords are never stored, transmitted in logs, or returned in API responses.

### Refresh Token Rotation & Revocation
- Refresh tokens are cryptographically random strings.
- Only the SHA-256 hash of the refresh token is stored in the `refresh_tokens` table.
- Each time a refresh token is exchanged, the previous token is marked `revoked_at = NOW()` and a fresh token is issued.
- If a revoked token is ever presented, the security subsystem flags potential token theft and invalidates all active sessions for that user.

---

## 2. Resource Ownership & Access Control

Every entity in the database is subject to strict multi-tenant ownership boundaries:
- **Papers**: Controlled by `owner_id` and `visibility` (`PRIVATE` vs `PUBLIC`). Private papers cannot be viewed, queried, or compared by other users.
- **Collections**: Owned by a specific user. Collections can only be modified or deleted by their owner.
- **Annotations**: User-specific notes attached to chunks or claims.
- **Generated Reviews**: Linked to `owner_id`.

In all JDBC repositories, user queries explicitly bind the caller's principal UUID:
```sql
SELECT * FROM papers WHERE id = ? AND (owner_id = ? OR visibility = 'PUBLIC');
```

---

## 3. Safe File Upload & PDF Sanitization

Uploading scientific PDFs is a common attack vector (e.g., zip-bombs, polyglot executables, path-traversal attacks). The `IngestionService.java` enforces four sequential defensive layers:

1. **Path Traversal Defense**: The original filename is sanitized to remove path components (`../`, `..\\`) and replaced with a randomly generated UUID:
   ```java
   String safeFileName = UUID.randomUUID() + ".pdf";
   Path targetPath = uploadDir.resolve(safeFileName).normalize();
   if (!targetPath.startsWith(uploadDir)) {
       throw new SecurityException("Potential path traversal attempt detected");
   }
   ```
2. **File Size Enforcement**: Multipart uploads are capped at 50MB both at the web tier and in application logic.
3. **MIME & Header Verification**: Verifies the MIME type is `application/pdf` and checks the `%PDF-` magic header bytes before handing the file to PDFBox.
4. **Isolated Storage**: Uploaded files are stored in a dedicated local directory outside the project classpath and web root.

---

## 4. Parameterized SQL & Database Defense

In strict compliance with project requirements:
- **No JPA or Hibernate**: All database access is implemented using Spring `JdbcTemplate`.
- **Zero String Concatenation**: Every SQL query uses prepared statements with `?` parameters:
  ```java
  // Safe Parameterized Query
  jdbcTemplate.query(
      "SELECT * FROM claims WHERE paper_id = ? AND claim_type = ?",
      rowMapper,
      paperId,
      claimType
  );
  ```
- This completely eliminates SQL injection vulnerabilities across all filter, search, and ingestion queries.

---

## 5. Safe Prompting & AI Guardrails

When interfacing with local Ollama models or external APIs:
- Input chunks are sanitized to strip system prompt delimiters.
- The system prompt explicitly commands the model to cite only the provided chunk IDs (`[C-1]`, `[C-2]`) and to return structured JSON.
- If the model returns invalid JSON, a defensive parsing layer repairs the output or falls back to a graceful error without exposing stack traces.

---

## 6. Logging Hygiene

The SLF4J logging configuration strictly prohibits:
- Passwords or credentials.
- Authorization header bearer tokens.
- Personal identifiable information (PII).
- Unsanitized binary content from uploaded PDFs.
