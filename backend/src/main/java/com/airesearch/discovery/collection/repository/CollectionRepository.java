package com.airesearch.discovery.collection.repository;

import com.airesearch.discovery.collection.dto.CollectionDtos.CollectionDetailDto;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class CollectionRepository {

    private final JdbcTemplate jdbcTemplate;

    public CollectionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public record CollectionEntity(UUID id, UUID ownerId, String name, String description, Instant createdAt, Instant updatedAt) {}

    public CollectionEntity save(CollectionEntity c) {
        UUID id = c.id() != null ? c.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = "INSERT INTO collections (id, owner_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, id, c.ownerId(), c.name(), c.description(), Timestamp.from(now), Timestamp.from(now));
        return new CollectionEntity(id, c.ownerId(), c.name(), c.description(), now, now);
    }

    public Optional<CollectionEntity> findById(UUID id) {
        String sql = "SELECT * FROM collections WHERE id = ?";
        try {
            CollectionEntity c = jdbcTemplate.queryForObject(sql, (rs, rowNum) -> new CollectionEntity(
                    rs.getObject("id", UUID.class),
                    rs.getObject("owner_id", UUID.class),
                    rs.getString("name"),
                    rs.getString("description"),
                    rs.getTimestamp("created_at").toInstant(),
                    rs.getTimestamp("updated_at").toInstant()
            ), id);
            return Optional.ofNullable(c);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<CollectionEntity> findByOwner(UUID ownerId) {
        String sql = "SELECT * FROM collections WHERE owner_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> new CollectionEntity(
                rs.getObject("id", UUID.class),
                rs.getObject("owner_id", UUID.class),
                rs.getString("name"),
                rs.getString("description"),
                rs.getTimestamp("created_at").toInstant(),
                rs.getTimestamp("updated_at").toInstant()
        ), ownerId);
    }

    public void update(UUID id, String name, String description) {
        String sql = "UPDATE collections SET name = ?, description = ?, updated_at = ? WHERE id = ?";
        jdbcTemplate.update(sql, name, description, Timestamp.from(Instant.now()), id);
    }

    public void delete(UUID id) {
        String sql = "DELETE FROM collections WHERE id = ?";
        jdbcTemplate.update(sql, id);
    }

    public void addPaper(UUID collectionId, UUID paperId) {
        String checkSql = "SELECT COUNT(*) FROM collection_papers WHERE collection_id = ? AND paper_id = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, collectionId, paperId);
        if (count == null || count == 0) {
            String sql = "INSERT INTO collection_papers (collection_id, paper_id) VALUES (?, ?)";
            jdbcTemplate.update(sql, collectionId, paperId);
        }
    }

    public void removePaper(UUID collectionId, UUID paperId) {
        String sql = "DELETE FROM collection_papers WHERE collection_id = ? AND paper_id = ?";
        jdbcTemplate.update(sql, collectionId, paperId);
    }

    public List<UUID> findPaperIds(UUID collectionId) {
        String sql = "SELECT paper_id FROM collection_papers WHERE collection_id = ?";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getObject("paper_id", UUID.class), collectionId);
    }
}
