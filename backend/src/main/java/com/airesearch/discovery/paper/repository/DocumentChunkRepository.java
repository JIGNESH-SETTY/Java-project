package com.airesearch.discovery.paper.repository;

import com.airesearch.discovery.paper.model.DocumentChunk;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class DocumentChunkRepository {

    private final JdbcTemplate jdbcTemplate;
    private final boolean isPostgres;

    public DocumentChunkRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        boolean postgres = false;
        try {
            DatabaseMetaData metaData = Objects.requireNonNull(jdbcTemplate.getDataSource()).getConnection().getMetaData();
            postgres = metaData.getDatabaseProductName().toLowerCase(Locale.ROOT).contains("postgres");
        } catch (Exception ignored) {}
        this.isPostgres = postgres;
    }

    private final RowMapper<DocumentChunk> rowMapper = (rs, rowNum) -> {
        float[] vector = null;
        Object embObj = rs.getObject("embedding");
        if (embObj != null) {
            String embStr = embObj.toString().replace("[", "").replace("]", "").trim();
            if (!embStr.isEmpty()) {
                String[] parts = embStr.split(",");
                vector = new float[parts.length];
                for (int i = 0; i < parts.length; i++) {
                    vector[i] = Float.parseFloat(parts[i].trim());
                }
            }
        }

        return new DocumentChunk(
                rs.getObject("id", UUID.class),
                rs.getObject("paper_id", UUID.class),
                rs.getInt("chunk_index"),
                rs.getString("section_name"),
                rs.getObject("page_number", Integer.class),
                rs.getInt("char_start"),
                rs.getInt("char_end"),
                rs.getString("content"),
                rs.getInt("token_count"),
                vector,
                rs.getString("embedding_model"),
                rs.getTimestamp("created_at").toInstant()
        );
    };

    public void saveBatch(List<DocumentChunk> chunks) {
        if (chunks.isEmpty()) return;

        String insertSql;
        if (isPostgres) {
            insertSql = """
                INSERT INTO document_chunks (id, paper_id, chunk_index, section_name, page_number, char_start, char_end, content, token_count, embedding, embedding_model, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?::vector, ?, ?)
                """;
        } else {
            insertSql = """
                INSERT INTO document_chunks (id, paper_id, chunk_index, section_name, page_number, char_start, char_end, content, token_count, embedding, embedding_model, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        }

        Instant now = Instant.now();
        List<Object[]> batchArgs = new ArrayList<>();
        for (DocumentChunk c : chunks) {
            UUID id = c.id() != null ? c.id() : UUID.randomUUID();
            String vectorStr = formatVector(c.embedding());
            batchArgs.add(new Object[]{
                    id,
                    c.paperId(),
                    c.chunkIndex(),
                    c.sectionName(),
                    c.pageNumber(),
                    c.charStart(),
                    c.charEnd(),
                    c.content(),
                    c.tokenCount(),
                    vectorStr,
                    c.embeddingModel(),
                    Timestamp.from(now)
            });
        }

        jdbcTemplate.batchUpdate(insertSql, batchArgs);
    }

    public List<DocumentChunk> findByPaperId(UUID paperId) {
        String sql = "SELECT * FROM document_chunks WHERE paper_id = ? ORDER BY chunk_index ASC";
        return jdbcTemplate.query(sql, rowMapper, paperId);
    }

    public Optional<DocumentChunk> findById(UUID id) {
        String sql = "SELECT * FROM document_chunks WHERE id = ?";
        try {
            DocumentChunk chunk = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(chunk);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<DocumentChunk> findByIds(List<UUID> ids) {
        if (ids.isEmpty()) return Collections.emptyList();
        String inSql = String.join(",", Collections.nCopies(ids.size(), "?"));
        String sql = "SELECT * FROM document_chunks WHERE id IN (" + inSql + ")";
        return jdbcTemplate.query(sql, rowMapper, ids.toArray());
    }

    public record ScoredChunk(DocumentChunk chunk, double score) {}

    public List<ScoredChunk> searchSemantic(float[] queryVector, int topK, UUID userId) {
        String vectorStr = formatVector(queryVector);

        if (isPostgres) {
            String sql = """
                SELECT c.*, (1.0 - (c.embedding <=> ?::vector)) AS similarity
                FROM document_chunks c
                JOIN papers p ON c.paper_id = p.id
                WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC')
                ORDER BY c.embedding <=> ?::vector ASC
                LIMIT ?
                """;
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                DocumentChunk chunk = rowMapper.mapRow(rs, rowNum);
                double score = rs.getDouble("similarity");
                return new ScoredChunk(chunk, score);
            }, vectorStr, userId, vectorStr, topK);
        } else {
            // In-memory fallback for H2 / unit tests
            String sql = """
                SELECT c.* FROM document_chunks c
                JOIN papers p ON c.paper_id = p.id
                WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC')
                """;
            List<DocumentChunk> all = jdbcTemplate.query(sql, rowMapper, userId);
            List<ScoredChunk> scored = new ArrayList<>();
            for (DocumentChunk chunk : all) {
                double sim = cosineSimilarity(queryVector, chunk.embedding());
                scored.add(new ScoredChunk(chunk, sim));
            }
            scored.sort((a, b) -> Double.compare(b.score(), a.score()));
            return scored.subList(0, Math.min(topK, scored.size()));
        }
    }

    public List<ScoredChunk> searchLexical(String query, int topK, UUID userId) {
        if (isPostgres) {
            String sql = """
                SELECT c.*, ts_rank_cd(to_tsvector('english', c.content), plainto_tsquery('english', ?)) AS rank
                FROM document_chunks c
                JOIN papers p ON c.paper_id = p.id
                WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC')
                  AND to_tsvector('english', c.content) @@ plainto_tsquery('english', ?)
                ORDER BY rank DESC
                LIMIT ?
                """;
            List<ScoredChunk> results = jdbcTemplate.query(sql, (rs, rowNum) -> {
                DocumentChunk chunk = rowMapper.mapRow(rs, rowNum);
                double rank = rs.getDouble("rank");
                return new ScoredChunk(chunk, rank);
            }, query, userId, query, topK);

            if (!results.isEmpty()) return results;
        }

        // Substring / ILIKE fallback for both Postgres and H2
        String likePattern = "%" + query.toLowerCase(Locale.ROOT) + "%";
        String sql = """
            SELECT c.* FROM document_chunks c
            JOIN papers p ON c.paper_id = p.id
            WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC')
              AND LOWER(c.content) LIKE ?
            LIMIT ?
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DocumentChunk chunk = rowMapper.mapRow(rs, rowNum);
            return new ScoredChunk(chunk, 0.75);
        }, userId, likePattern, topK);
    }

    private String formatVector(float[] vector) {
        if (vector == null || vector.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) sb.append(",");
        }
        sb.append("]");
        return sb.toString();
    }

    private double cosineSimilarity(float[] v1, float[] v2) {
        if (v1 == null || v2 == null || v1.length != v2.length) return 0.0;
        double dot = 0.0, normA = 0.0, normB = 0.0;
        for (int i = 0; i < v1.length; i++) {
            dot += v1[i] * v2[i];
            normA += v1[i] * v1[i];
            normB += v2[i] * v2[i];
        }
        if (normA <= 0.0 || normB <= 0.0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
