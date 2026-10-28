package com.airesearch.discovery.paper.repository;

import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.shared.enums.PaperVisibility;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class PaperRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaperRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Paper> rowMapper = (rs, rowNum) -> new Paper(
            rs.getObject("id", UUID.class),
            rs.getObject("owner_id", UUID.class),
            rs.getString("title"),
            rs.getString("abstract"),
            rs.getString("doi"),
            rs.getObject("publication_year", Integer.class),
            rs.getString("venue"),
            rs.getString("document_path"),
            rs.getString("processing_status"),
            rs.getString("processing_error"),
            PaperVisibility.valueOf(rs.getString("visibility")),
            rs.getTimestamp("created_at").toInstant(),
            rs.getTimestamp("updated_at").toInstant()
    );

    public Paper save(Paper paper) {
        UUID id = paper.id() != null ? paper.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO papers (id, owner_id, title, abstract, doi, publication_year, venue, document_path, processing_status, processing_error, visibility, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                paper.ownerId(),
                paper.title(),
                paper.abstractText(),
                paper.doi(),
                paper.publicationYear(),
                paper.venue(),
                paper.documentPath(),
                paper.processingStatus() != null ? paper.processingStatus() : "PENDING",
                paper.processingError(),
                paper.visibility() != null ? paper.visibility().name() : PaperVisibility.PRIVATE.name(),
                Timestamp.from(now),
                Timestamp.from(now)
        );
        return new Paper(id, paper.ownerId(), paper.title(), paper.abstractText(), paper.doi(),
                paper.publicationYear(), paper.venue(), paper.documentPath(), paper.processingStatus(),
                paper.processingError(), paper.visibility(), now, now);
    }

    public void update(Paper paper) {
        String sql = """
            UPDATE papers SET title = ?, abstract = ?, doi = ?, publication_year = ?, venue = ?,
            document_path = ?, processing_status = ?, processing_error = ?, visibility = ?, updated_at = ?
            WHERE id = ?
            """;
        jdbcTemplate.update(sql,
                paper.title(),
                paper.abstractText(),
                paper.doi(),
                paper.publicationYear(),
                paper.venue(),
                paper.documentPath(),
                paper.processingStatus(),
                paper.processingError(),
                paper.visibility().name(),
                Timestamp.from(Instant.now()),
                paper.id()
        );
    }

    public void updateProcessingStatus(UUID paperId, String status, String error) {
        String sql = "UPDATE papers SET processing_status = ?, processing_error = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, status, error, Timestamp.from(Instant.now()), paperId);
    }

    public Optional<Paper> findById(UUID id) {
        String sql = "SELECT * FROM papers WHERE id = ?";
        try {
            Paper paper = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(paper);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Paper> findAllAccessible(UUID userId, int limit, int offset) {
        String sql = """
            SELECT * FROM papers
            WHERE owner_id = ? OR visibility = 'PUBLIC'
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """;
        return jdbcTemplate.query(sql, rowMapper, userId, limit, offset);
    }

    public List<Paper> findByIds(List<UUID> ids) {
        if (ids.isEmpty()) return Collections.emptyList();
        String inSql = String.join(",", Collections.nCopies(ids.size(), "?"));
        String sql = "SELECT * FROM papers WHERE id IN (" + inSql + ") ORDER BY publication_year DESC";
        return jdbcTemplate.query(sql, rowMapper, ids.toArray());
    }

    public int countAccessible(UUID userId) {
        String sql = "SELECT COUNT(*) FROM papers WHERE owner_id = ? OR visibility = 'PUBLIC'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }

    public void delete(UUID id) {
        String sql = "DELETE FROM papers WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }
}
