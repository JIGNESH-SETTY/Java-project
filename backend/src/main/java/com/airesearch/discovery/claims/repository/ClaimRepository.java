package com.airesearch.discovery.claims.repository;

import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.shared.enums.ClaimType;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class ClaimRepository {

    private final JdbcTemplate jdbcTemplate;

    public ClaimRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Claim> rowMapper = (rs, rowNum) -> new Claim(
            rs.getObject("id", UUID.class),
            rs.getObject("paper_id", UUID.class),
            rs.getObject("source_chunk_id", UUID.class),
            rs.getString("normalized_text"),
            rs.getString("source_text"),
            ClaimType.valueOf(rs.getString("claim_type")),
            ProvenanceType.valueOf(rs.getString("provenance_type")),
            rs.getDouble("extraction_confidence"),
            rs.getString("section_name"),
            rs.getObject("page_number", Integer.class),
            rs.getObject("created_by", UUID.class),
            rs.getTimestamp("created_at").toInstant(),
            rs.getTimestamp("updated_at").toInstant()
    );

    public Claim save(Claim claim) {
        UUID id = claim.id() != null ? claim.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO claims (id, paper_id, source_chunk_id, normalized_text, source_text, claim_type, provenance_type, extraction_confidence, section_name, page_number, created_by, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                claim.paperId(),
                claim.sourceChunkId(),
                claim.normalizedText(),
                claim.sourceText(),
                claim.claimType().name(),
                claim.provenanceType().name(),
                claim.extractionConfidence(),
                claim.sectionName(),
                claim.pageNumber(),
                claim.createdBy(),
                Timestamp.from(now),
                Timestamp.from(now)
        );
        return new Claim(id, claim.paperId(), claim.sourceChunkId(), claim.normalizedText(), claim.sourceText(),
                claim.claimType(), claim.provenanceType(), claim.extractionConfidence(), claim.sectionName(),
                claim.pageNumber(), claim.createdBy(), now, now);
    }

    public Optional<Claim> findById(UUID id) {
        String sql = "SELECT * FROM claims WHERE id = ?";
        try {
            Claim claim = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(claim);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Claim> findByPaperId(UUID paperId) {
        String sql = "SELECT * FROM claims WHERE paper_id = ? ORDER BY page_number ASC, created_at ASC";
        return jdbcTemplate.query(sql, rowMapper, paperId);
    }

    public List<Claim> findAllAccessible(UUID userId, int limit, int offset) {
        String sql = """
            SELECT c.* FROM claims c
            LEFT JOIN papers p ON c.paper_id = p.id
            WHERE c.created_by = ? OR p.owner_id = ? OR p.visibility = 'PUBLIC'
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
            """;
        return jdbcTemplate.query(sql, rowMapper, userId, userId, limit, offset);
    }

    public List<Claim> findByIds(List<UUID> ids) {
        if (ids.isEmpty()) return Collections.emptyList();
        String inSql = String.join(",", Collections.nCopies(ids.size(), "?"));
        String sql = "SELECT * FROM claims WHERE id IN (" + inSql + ")";
        return jdbcTemplate.query(sql, rowMapper, ids.toArray());
    }

    public void update(Claim claim) {
        String sql = """
            UPDATE claims
            SET normalized_text = ?, source_text = ?, claim_type = ?, provenance_type = ?,
                extraction_confidence = ?, section_name = ?, page_number = ?, updated_at = ?
            WHERE id = ?
            """;
        jdbcTemplate.update(sql,
                claim.normalizedText(),
                claim.sourceText(),
                claim.claimType().name(),
                claim.provenanceType().name(),
                claim.extractionConfidence(),
                claim.sectionName(),
                claim.pageNumber(),
                Timestamp.from(Instant.now()),
                claim.id()
        );
    }
}
