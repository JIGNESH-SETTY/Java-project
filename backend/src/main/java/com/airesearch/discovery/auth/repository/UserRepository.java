package com.airesearch.discovery.auth.repository;

import com.airesearch.discovery.auth.model.User;
import com.airesearch.discovery.shared.enums.UserRole;
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
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> rowMapper = (rs, rowNum) -> new User(
            rs.getObject("id", UUID.class),
            rs.getString("email"),
            rs.getString("password_hash"),
            rs.getString("display_name"),
            UserRole.valueOf(rs.getString("role")),
            rs.getTimestamp("created_at").toInstant(),
            rs.getTimestamp("updated_at").toInstant()
    );

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, email, password_hash, display_name, role, created_at, updated_at FROM users WHERE email = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, rowMapper, email);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findById(UUID id) {
        String sql = "SELECT id, email, password_hash, display_name, role, created_at, updated_at FROM users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    public User save(User user) {
        UUID id = user.id() != null ? user.id() : UUID.randomUUID();
        Instant now = Instant.now();
        String sql = """
            INSERT INTO users (id, email, password_hash, display_name, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """;
        jdbcTemplate.update(sql,
                id,
                user.email(),
                user.passwordHash(),
                user.displayName(),
                user.role().name(),
                Timestamp.from(now),
                Timestamp.from(now)
        );
        return new User(id, user.email(), user.passwordHash(), user.displayName(), user.role(), now, now);
    }
}
