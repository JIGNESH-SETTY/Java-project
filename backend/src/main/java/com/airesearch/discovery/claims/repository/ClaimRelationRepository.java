package com.airesearch.discovery.claims.repository;

import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.shared.enums.EvidenceRole;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import com.airesearch.discovery.shared.enums.RelationType;
import com.airesearch.discovery.shared.enums.ReviewStatus;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class ClaimRelationRepository {

    private final JdbcTemplate jdbcTemplate;

    public ClaimRelationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<ClaimRelation> rowMapper = (rs, rowNum) -> {
        UUID id = rs.getObject("id", UUID.class);
        return new ClaimRelation(
                id,
                rs.getObject("source_claim_id", UUID.class),
                rs.getObject("target_claim_id", UUID.class),
                RelationType.valueOf(rs.getString("relation_type")),
                rs.getDouble("confidence"),
                rs.getString("rationale"),
                ProvenanceType.valueOf(rs.getString("provenance_type")),
                ReviewStatus.valueOf(rs.getString("review_status")),
                rs.getObject("created_by", UUID.class),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant(),
                Collections.emptyList()
        );
    };

    public ClaimRelation save(ClaimRelation relation, List<UUID> evidenceChunkIds) {
        UUID id = relation.id() != null ? relation.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO claim_relations (id, source_claim_id, target_claim_id, relation_type, confidence, rationale, provenance_type, review_status, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                relation.sourceClaimId(),
                relation.targetClaimId(),
                relation.relationType().name(),
                relation.confidence(),
                relation.rationale(),
                relation.provenanceType().name(),
                relation.reviewStatus().name(),
                relation.createdBy(),
                Timestamp.from(now),
                Timestamp.from(now)
        );

        if (evidenceChunkIds != null && !evidenceChunkIds.isEmpty()) {
            String checkSql = "SELECT COUNT(*) FROM claim_relation_evidence WHERE claim_relation_id = ? AND evidence_chunk_id = ?";
            String insertEvidenceSql = "INSERT INTO claim_relation_evidence (claim_relation_id, evidence_chunk_id, evidence_role) VALUES (?, ?, ?)";
            for (UUID chunkId : evidenceChunkIds) {
                Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, id, chunkId);
                if (count == null || count == 0) {
                    jdbcTemplate.update(insertEvidenceSql, id, chunkId, EvidenceRole.SOURCE_EVIDENCE.name());
                }
            }
        }

        return new ClaimRelation(id, relation.sourceClaimId(), relation.targetClaimId(), relation.relationType(),
                relation.confidence(), relation.rationale(), relation.provenanceType(), relation.reviewStatus(),
                relation.createdBy(), now, now, evidenceChunkIds != null ? evidenceChunkIds : Collections.emptyList());
    }

    public Optional<ClaimRelation> findById(UUID id) {
        String sql = "SELECT * FROM claim_relations WHERE id = ?";
        try {
            ClaimRelation r = jdbcTemplate.queryForObject(sql, rowMapper, id);
            if (r != null) {
                List<UUID> evidence = findEvidenceChunkIds(r.id());
                return Optional.of(new ClaimRelation(r.id(), r.sourceClaimId(), r.targetClaimId(), r.relationType(),
                        r.confidence(), r.rationale(), r.provenanceType(), r.reviewStatus(), r.createdBy(),
                        r.createdAt(), r.updatedAt(), evidence));
            }
            return Optional.empty();
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<ClaimRelation> findByClaimId(UUID claimId) {
        String sql = "SELECT * FROM claim_relations WHERE source_claim_id = ? OR target_claim_id = ?";
        List<ClaimRelation> list = jdbcTemplate.query(sql, rowMapper, claimId, claimId);
        List<ClaimRelation> enriched = new ArrayList<>();
        for (ClaimRelation r : list) {
            enriched.add(new ClaimRelation(r.id(), r.sourceClaimId(), r.targetClaimId(), r.relationType(),
                    r.confidence(), r.rationale(), r.provenanceType(), r.reviewStatus(), r.createdBy(),
                    r.createdAt(), r.updatedAt(), findEvidenceChunkIds(r.id())));
        }
        return enriched;
    }

    public List<ClaimRelation> findAll() {
        String sql = "SELECT * FROM claim_relations ORDER BY created_at DESC LIMIT 200";
        List<ClaimRelation> list = jdbcTemplate.query(sql, rowMapper);
        List<ClaimRelation> enriched = new ArrayList<>();
        for (ClaimRelation r : list) {
            enriched.add(new ClaimRelation(r.id(), r.sourceClaimId(), r.targetClaimId(), r.relationType(),
                    r.confidence(), r.rationale(), r.provenanceType(), r.reviewStatus(), r.createdBy(),
                    r.createdAt(), r.updatedAt(), findEvidenceChunkIds(r.id())));
        }
        return enriched;
    }

    public void updateReviewStatus(UUID relationId, ReviewStatus status) {
        String sql = "UPDATE claim_relations SET review_status = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, status.name(), Timestamp.from(Instant.now()), relationId);
    }

    public List<UUID> findEvidenceChunkIds(UUID relationId) {
        String sql = "SELECT evidence_chunk_id FROM claim_relation_evidence WHERE claim_relation_id = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getObject("evidence_chunk_id", UUID.class), relationId);
    }
}
