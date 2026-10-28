package com.airesearch.discovery.paper.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class ReferenceRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReferenceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record ReferenceRecord(
            UUID id,
            UUID sourcePaperId,
            String rawReferenceText,
            UUID citedPaperId,
            String citedTitle,
            String citedDoi,
            String resolutionStatus,
            Instant createdAt
    ) {}

    public void saveReferences(UUID sourcePaperId, List<String> rawReferences) {
        if (rawReferences == null || rawReferences.isEmpty()) return;
        String sql = """
            INSERT INTO paper_references (id, source_paper_id, raw_reference_text, resolution_status, created_at)
            VALUES (?, ?, ?, 'UNRESOLVED', ?)
            """;
        Instant now = Instant.now();
        List<Object[]> batch = new ArrayList<>();
        for (String raw : rawReferences) {
            batch.add(new Object[]{UUID.randomUUID(), sourcePaperId, raw, Timestamp.from(now)});
        }
        jdbcTemplate.batchUpdate(sql, batch);
    }

    public List<ReferenceRecord> findBySourcePaperId(UUID sourcePaperId) {
        String sql = "SELECT * FROM paper_references WHERE source_paper_id = ? ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ReferenceRecord(
                rs.getObject("id", UUID.class),
                rs.getObject("source_paper_id", UUID.class),
                rs.getString("raw_reference_text"),
                rs.getObject("cited_paper_id", UUID.class),
                rs.getString("cited_title"),
                rs.getString("cited_doi"),
                rs.getString("resolution_status"),
                rs.getTimestamp("created_at").toInstant()
        ), sourcePaperId);
    }

    public List<ReferenceRecord> findCitationsToPaper(UUID targetPaperId) {
        String sql = "SELECT * FROM paper_references WHERE cited_paper_id = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ReferenceRecord(
                rs.getObject("id", UUID.class),
                rs.getObject("source_paper_id", UUID.class),
                rs.getString("raw_reference_text"),
                rs.getObject("cited_paper_id", UUID.class),
                rs.getString("cited_title"),
                rs.getString("cited_doi"),
                rs.getString("resolution_status"),
                rs.getTimestamp("created_at").toInstant()
        ), targetPaperId);
    }
}
