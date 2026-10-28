package com.airesearch.discovery.paper.repository;

import com.airesearch.discovery.shared.enums.ConceptType;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class ConceptRepository {

    private final JdbcTemplate jdbcTemplate;

    public ConceptRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record ConceptRecord(UUID id, String normalizedName, String displayName, ConceptType conceptType, Instant createdAt) {}

    public record PaperConceptRecord(
            UUID paperId,
            UUID conceptId,
            String conceptName,
            ConceptType conceptType,
            String relationType,
            UUID evidenceChunkId,
            double confidence,
            ProvenanceType provenanceType
    ) {}

    public ConceptRecord findOrCreate(String displayName, ConceptType conceptType) {
        String normalized = displayName.toLowerCase(Locale.ROOT).trim();
        String findSql = "SELECT id, normalized_name, display_name, concept_type, created_at FROM concepts WHERE normalized_name = ?";
        List<ConceptRecord> existing = jdbcTemplate.query(findSql, (rs, rowNum) -> new ConceptRecord(
                rs.getObject("id", UUID.class),
                rs.getString("normalized_name"),
                rs.getString("display_name"),
                ConceptType.valueOf(rs.getString("concept_type")),
                rs.getTimestamp("created_at").toInstant()
        ), normalized);

        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        UUID id = UUID.randomUUID();
        Instant now = Instant.now();
        String insertSql = "INSERT INTO concepts (id, normalized_name, display_name, concept_type, created_at) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(insertSql, id, normalized, displayName.trim(), conceptType.name(), Timestamp.from(now));
        return new ConceptRecord(id, normalized, displayName.trim(), conceptType, now);
    }

    public void linkPaperConcept(UUID paperId, UUID conceptId, String relationType, UUID evidenceChunkId, double confidence, ProvenanceType provenance) {
        String checkSql = "SELECT COUNT(*) FROM paper_concepts WHERE paper_id = ? AND concept_id = ? AND relation_type = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, paperId, conceptId, relationType);
        if (count != null && count > 0) {
            String updateSql = "UPDATE paper_concepts SET confidence = ?, evidence_chunk_id = ?, provenance_type = ? WHERE paper_id = ? AND concept_id = ? AND relation_type = ?";
            jdbcTemplate.update(updateSql, confidence, evidenceChunkId, provenance.name(), paperId, conceptId, relationType);
        } else {
            String insertSql = "INSERT INTO paper_concepts (paper_id, concept_id, relation_type, evidence_chunk_id, confidence, provenance_type) VALUES (?, ?, ?, ?, ?, ?)";
            jdbcTemplate.update(insertSql, paperId, conceptId, relationType, evidenceChunkId, confidence, provenance.name());
        }
    }

    public List<PaperConceptRecord> findByPaperId(UUID paperId) {
        String sql = """
            SELECT pc.paper_id, pc.concept_id, c.display_name AS concept_name, c.concept_type,
                   pc.relation_type, pc.evidence_chunk_id, pc.confidence, pc.provenance_type
            FROM paper_concepts pc
            JOIN concepts c ON pc.concept_id = c.id
            WHERE pc.paper_id = ?
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new PaperConceptRecord(
                rs.getObject("paper_id", UUID.class),
                rs.getObject("concept_id", UUID.class),
                rs.getString("concept_name"),
                ConceptType.valueOf(rs.getString("concept_type")),
                rs.getString("relation_type"),
                rs.getObject("evidence_chunk_id", UUID.class),
                rs.getDouble("confidence"),
                ProvenanceType.valueOf(rs.getString("provenance_type"))
        ), paperId);
    }

    public List<ConceptRecord> findAll() {
        String sql = "SELECT * FROM concepts ORDER BY display_name ASC LIMIT 200";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new ConceptRecord(
                rs.getObject("id", UUID.class),
                rs.getString("normalized_name"),
                rs.getString("display_name"),
                ConceptType.valueOf(rs.getString("concept_type")),
                rs.getTimestamp("created_at").toInstant()
        ));
    }
}
