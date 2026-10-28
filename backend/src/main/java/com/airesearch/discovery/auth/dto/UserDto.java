package com.airesearch.discovery.auth.dto;

import com.airesearch.discovery.shared.enums.UserRole;
import java.time.Instant;
import java.util.UUID;

public record UserDto(
    UUID id,
    String email,
    String displayName,
    UserRole role,
    Instant createdAt
) {}
