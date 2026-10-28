package com.airesearch.discovery.ingestion.repository;

import com.airesearch.discovery.ingestion.model.IngestionJob;
import com.airesearch.discovery.shared.enums.JobStatus;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public class IngestionJobRepository {

    private final JdbcTemplate jdbcTemplate;

    public IngestionJobRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<IngestionJob> rowMapper = (rs, rowNum) -> new IngestionJob(
            rs.getObject("id", UUID.class),
            rs.getObject("paper_id", UUID.class),
            JobStatus.valueOf(rs.getString("status")),
            rs.getString("current_stage"),
            rs.getString("warning_message"),
            rs.getString("error_message"),
            rs.getTimestamp("started_at").toInstant(),
            rs.getTimestamp("completed_at") != null ? rs.getTimestamp("completed_at").toInstant() : null
    );

    public IngestionJob save(IngestionJob job) {
        UUID id = job.id() != null ? job.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO ingestion_jobs (id, paper_id, status, current_stage, warning_message, error_message, started_at, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                job.paperId(),
                job.status().name(),
                job.currentStage(),
                job.warningMessage(),
                job.errorMessage(),
                Timestamp.from(now),
                job.completedAt() != null ? Timestamp.from(job.completedAt()) : null
        );
        return new IngestionJob(id, job.paperId(), job.status(), job.currentStage(), job.warningMessage(), job.errorMessage(), now, job.completedAt());
    }

    public void update(IngestionJob job) {
        String sql = """
            UPDATE ingestion_jobs
            SET status = ?, current_stage = ?, warning_message = ?, error_message = ?, completed_at = ?
            WHERE id = ?
            """;
        jdbcTemplate.update(sql,
                job.status().name(),
                job.currentStage(),
                job.warningMessage(),
                job.errorMessage(),
                job.completedAt() != null ? Timestamp.from(job.completedAt()) : null,
                job.id()
        );
    }

    public Optional<IngestionJob> findByPaperId(UUID paperId) {
        String sql = "SELECT * FROM ingestion_jobs WHERE paper_id = ? ORDER BY started_at DESC LIMIT 1";
        try {
            IngestionJob job = jdbcTemplate.queryForObject(sql, rowMapper, paperId);
            return Optional.ofNullable(job);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }
}
