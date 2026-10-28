package com.airesearch.discovery.annotation.repository;

import com.airesearch.discovery.annotation.dto.AnnotationDtos.AnnotationDto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class AnnotationRepository {

    private final JdbcTemplate jdbcTemplate;

    public AnnotationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<AnnotationDto> rowMapper = (rs, rowNum) -> new AnnotationDto(
            rs.getObject("id", UUID.class),
            rs.getObject("user_id", UUID.class),
            rs.getObject("paper_id", UUID.class),
            rs.getObject("chunk_id", UUID.class),
            rs.getObject("claim_id", UUID.class),
            rs.getString("body"),
            rs.getString("annotation_type"),
            rs.getTimestamp("created_at").toInstant(),
            rs.getTimestamp("updated_at").toInstant()
    );

    public AnnotationDto save(AnnotationDto a) {
        UUID id = a.id() != null ? a.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO annotations (id, user_id, paper_id, chunk_id, claim_id, body, annotation_type, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                a.userId(),
                a.paperId(),
                a.chunkId(),
                a.claimId(),
                a.body(),
                a.annotationType() != null ? a.annotationType() : "NOTE",
                Timestamp.from(now),
                Timestamp.from(now)
        );
        return new AnnotationDto(id, a.userId(), a.paperId(), a.chunkId(), a.claimId(), a.body(), a.annotationType(), now, now);
    }

    public Optional<AnnotationDto> findById(UUID id) {
        String sql = "SELECT * FROM annotations WHERE id = ?";
        try {
            AnnotationDto a = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(a);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<AnnotationDto> findByPaper(UUID paperId) {
        String sql = "SELECT * FROM annotations WHERE paper_id = ? ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, rowMapper, paperId);
    }

    public List<AnnotationDto> findByClaim(UUID claimId) {
        String sql = "SELECT * FROM annotations WHERE claim_id = ? ORDER BY created_at ASC";
        return jdbcTemplate.query(sql, rowMapper, claimId);
    }

    public List<AnnotationDto> findByUser(UUID userId) {
        String sql = "SELECT * FROM annotations WHERE user_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    public void update(UUID id, String body) {
        String sql = "UPDATE annotations SET body = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, body, Timestamp.from(Instant.now()), id);
    }

    public void delete(UUID id) {
        String sql = "DELETE FROM annotations WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
