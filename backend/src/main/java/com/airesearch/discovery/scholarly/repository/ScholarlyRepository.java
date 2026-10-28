package com.airesearch.discovery.scholarly.repository;

import com.airesearch.discovery.scholarly.model.PaperAccessLink;
import com.airesearch.discovery.scholarly.model.PaperExternalIdentifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public class ScholarlyRepository {

    private final JdbcTemplate jdbcTemplate;

    public ScholarlyRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void saveExternalIdentifier(PaperExternalIdentifier identifier) {
        String sql = """
            INSERT INTO paper_external_identifiers
            (id, paper_id, provider, external_id, external_url, canonical_doi, metadata_source, imported_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING
        """;
        jdbcTemplate.update(
                sql,
                identifier.id(),
                identifier.paperId(),
                identifier.provider(),
                identifier.externalId(),
                identifier.externalUrl(),
                identifier.canonicalDoi(),
                identifier.metadataSource(),
                Timestamp.from(identifier.importedAt() != null ? identifier.importedAt() : Instant.now())
        );
    }

    public void saveAccessLink(PaperAccessLink link) {
        String sql = """
            INSERT INTO paper_access_links
            (id, paper_id, url, link_type, access_status, license_name, source_provider, checked_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO NOTHING
        """;
        jdbcTemplate.update(
                sql,
                link.id(),
                link.paperId(),
                link.url(),
                link.linkType(),
                link.accessStatus(),
                link.licenseName(),
                link.sourceProvider(),
                Timestamp.from(link.checkedAt() != null ? link.checkedAt() : Instant.now())
        );
    }

    public List<PaperExternalIdentifier> findExternalIdentifiersByPaperId(UUID paperId) {
        String sql = """
            SELECT id, paper_id, provider, external_id, external_url, canonical_doi, metadata_source, imported_at
            FROM paper_external_identifiers
            WHERE paper_id = ?
            ORDER BY imported_at ASC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new PaperExternalIdentifier(
                (UUID) rs.getObject("id"),
                (UUID) rs.getObject("paper_id"),
                rs.getString("provider"),
                rs.getString("external_id"),
                rs.getString("external_url"),
                rs.getString("canonical_doi"),
                rs.getString("metadata_source"),
                rs.getTimestamp("imported_at").toInstant()
        ), paperId);
    }

    public List<PaperAccessLink> findAccessLinksByPaperId(UUID paperId) {
        String sql = """
            SELECT id, paper_id, url, link_type, access_status, license_name, source_provider, checked_at
            FROM paper_access_links
            WHERE paper_id = ?
            ORDER BY checked_at ASC
        """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new PaperAccessLink(
                (UUID) rs.getObject("id"),
                (UUID) rs.getObject("paper_id"),
                rs.getString("url"),
                rs.getString("link_type"),
                rs.getString("access_status"),
                rs.getString("license_name"),
                rs.getString("source_provider"),
                rs.getTimestamp("checked_at").toInstant()
        ), paperId);
    }
}
