package com.airesearch.discovery.paper.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class AuthorRepository {

    private final JdbcTemplate jdbcTemplate;

    public AuthorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record AuthorRecord(UUID id, String normalizedName, String displayName, String orcid) {}

    public AuthorRecord findOrCreate(String displayName, String orcid) {
        String normalized = displayName.toLowerCase(Locale.ROOT).trim();
        String findSql = "SELECT id, normalized_name, display_name, orcid FROM authors WHERE normalized_name = ?";
        List<AuthorRecord> existing = jdbcTemplate.query(findSql, (rs, rowNum) -> new AuthorRecord(
                rs.getObject("id", UUID.class),
                rs.getString("normalized_name"),
                rs.getString("display_name"),
                rs.getString("orcid")
        ), normalized);

        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        UUID id = UUID.randomUUID();
        String insertSql = "INSERT INTO authors (id, normalized_name, display_name, orcid) VALUES (?, ?, ?, ?)";
        jdbcTemplate.update(insertSql, id, normalized, displayName, orcid);
        return new AuthorRecord(id, normalized, displayName, orcid);
    }

    public void linkPaperAuthor(UUID paperId, UUID authorId, int order) {
        String checkSql = "SELECT COUNT(*) FROM paper_authors WHERE paper_id = ? AND author_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, paperId, authorId);
        if (count == null || count == 0) {
            String sql = "INSERT INTO paper_authors (paper_id, author_id, author_order) VALUES (?, ?, ?)";
            jdbcTemplate.update(sql, paperId, authorId, order);
        }
    }

    public List<AuthorRecord> findByPaperId(UUID paperId) {
        String sql = """
            SELECT a.id, a.normalized_name, a.display_name, a.orcid
            FROM authors a
            JOIN paper_authors pa ON a.id = pa.author_id
            WHERE pa.paper_id = ?
            ORDER BY pa.author_order ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new AuthorRecord(
                rs.getObject("id", UUID.class),
                rs.getString("normalized_name"),
                rs.getString("display_name"),
                rs.getString("orcid")
        ), paperId);
    }
}
