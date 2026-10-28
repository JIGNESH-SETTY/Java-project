package com.airesearch.discovery.review.repository;

import com.airesearch.discovery.review.dto.ReviewDtos.*;
import com.airesearch.discovery.shared.enums.EvidenceRole;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class ReviewRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReviewRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record GeneratedReviewEntity(
            UUID id,
            UUID ownerId,
            UUID collectionId,
            String query,
            String title,
            String contentMarkdown,
            String modelName,
            String status,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public GeneratedReviewEntity save(GeneratedReviewEntity review) {
        UUID id = review.id() != null ? review.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO generated_reviews (id, owner_id, collection_id, query, title, content_markdown, model_name, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                review.ownerId(),
                review.collectionId(),
                review.query(),
                review.title(),
                review.contentMarkdown(),
                review.modelName(),
                review.status(),
                Timestamp.from(now),
                Timestamp.from(now)
        );
        return new GeneratedReviewEntity(id, review.ownerId(), review.collectionId(), review.query(), review.title(),
                review.contentMarkdown(), review.modelName(), review.status(), now, now);
    }

    public void saveEvidenceBatch(UUID reviewId, List<ReviewEvidenceItem> items) {
        if (items.isEmpty()) return;
        String sql = """
            INSERT INTO review_evidence (id, review_id, paragraph_index, chunk_id, citation_label, evidence_role)
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        List<Object[]> batch = new ArrayList<>();
        for (ReviewEvidenceItem item : items) {
            UUID id = item.id() != null ? item.id() : UUID.randomUUID();
            batch.add(new Object[]{
                    id,
                    reviewId,
                    item.paragraphIndex(),
                    item.chunkId(),
                    item.citationLabel(),
                    item.evidenceRole().name()
            });
        }
        jdbcTemplate.batchUpdate(sql, batch);
    }

    public Optional<GeneratedReviewEntity> findById(UUID id) {
        String sql = "SELECT * FROM generated_reviews WHERE id = ?";
        try {
            GeneratedReviewEntity entity = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new GeneratedReviewEntity(
                    rs.getObject("id", UUID.class),
                    rs.getObject("owner_id", UUID.class),
                    rs.getObject("collection_id", UUID.class),
                    rs.getString("query"),
                    rs.getString("title"),
                    rs.getString("content_markdown"),
                    rs.getString("model_name"),
                    rs.getString("status"),
                    rs.getTimestamp("created_at").toInstant(),
                    rs.getTimestamp("updated_at").toInstant()
            ), id);
            return Optional.ofNullable(entity);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<GeneratedReviewEntity> findByOwner(UUID ownerId) {
        String sql = "SELECT * FROM generated_reviews WHERE owner_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new GeneratedReviewEntity(
                rs.getObject("id", UUID.class),
                rs.getObject("owner_id", UUID.class),
                rs.getObject("collection_id", UUID.class),
                rs.getString("query"),
                rs.getString("title"),
                rs.getString("content_markdown"),
                rs.getString("model_name"),
                rs.getString("status"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        ), ownerId);
    }

    public List<ReviewEvidenceItem> findEvidenceByReviewId(UUID reviewId) {
        String sql = """
            SELECT re.id, re.paragraph_index, re.chunk_id, re.citation_label, re.evidence_role,
                   c.paper_id, c.page_number, c.section_name, c.content AS snippet,
                   p.title AS paper_title
            FROM review_evidence re
            JOIN document_chunks c ON re.chunk_id = c.id
            JOIN papers p ON c.paper_id = p.id
            WHERE re.review_id = ?
            ORDER BY re.paragraph_index ASC
            """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            String fullSnippet = rs.getString("snippet");
            String displaySnippet = fullSnippet != null && fullSnippet.length() > 250
                    ? fullSnippet.substring(0, 250) + "..."
                    : fullSnippet;

            return new ReviewEvidenceItem(
                    rs.getObject("id", UUID.class),
                    rs.getInt("paragraph_index"),
                    rs.getObject("chunk_id", UUID.class),
                    rs.getObject("paper_id", UUID.class),
                    rs.getString("paper_title"),
                    rs.getObject("page_number", Integer.class),
                    rs.getString("section_name"),
                    displaySnippet,
                    rs.getString("citation_label"),
                    EvidenceRole.valueOf(rs.getString("evidence_role"))
            );
        }, reviewId);
    }
}
