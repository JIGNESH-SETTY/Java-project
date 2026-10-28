package com.airesearch.discovery.auth.model;

import com.airesearch.discovery.shared.enums.UserRole;
import java.time.Instant;
import java.util.UUID;

public record User(
    UUID id,
    String email,
    String passwordHash,
    String displayName,
    UserRole role,
    Instant createdAt,
    Instant updatedAt
) {}
