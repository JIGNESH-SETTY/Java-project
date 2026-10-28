package com.airesearch.discovery.auth.repository;

import com.airesearch.discovery.auth.model.RefreshToken;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public class RefreshTokenRepository {

    private final JdbcTemplate jdbcTemplate;

    public RefreshTokenRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<RefreshToken> rowMapper = (rs, rowNum) -> new RefreshToken(
            rs.getObject("id", UUID.class),
            rs.getObject("user_id", UUID.class),
            rs.getString("token_hash"),
            rs.getTimestamp("expires_at").toInstant(),
            rs.getTimestamp("revoked_at") != null ? rs.getTimestamp("revoked_at").toInstant() : null,
            rs.getTimestamp("created_at").toInstant()
    );

    public RefreshToken save(RefreshToken token) {
        UUID id = token.id() != null ? token.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                token.userId(),
                token.tokenHash(),
                Timestamp.from(token.expiresAt()),
                token.revokedAt() != null ? Timestamp.from(token.revokedAt()) : null,
                Timestamp.from(now)
        );
        return new RefreshToken(id, token.userId(), token.tokenHash(), token.expiresAt(), token.revokedAt(), now);
    }

    public Optional<RefreshToken> findByTokenHash(String tokenHash) {
        String sql = "SELECT id, user_id, token_hash, expires_at, revoked_at, created_at FROM refresh_tokens WHERE token_hash = ?";
        try {
            RefreshToken token = jdbcTemplate.queryForObject(sql, rowMapper, tokenHash);
            return Optional.ofNullable(token);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public void revokeByTokenHash(String tokenHash) {
        String sql = "UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ?";
        jdbcTemplate.update(sql, Timestamp.from(Instant.now()), tokenHash);
    }

    public void revokeAllForUser(UUID userId) {
        String sql = "UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL";
        jdbcTemplate.update(sql, Timestamp.from(Instant.now()), userId);
    }
}
