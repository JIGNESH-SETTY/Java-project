package com.airesearch.discovery.claims.model;

import com.airesearch.discovery.shared.enums.ClaimType;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import java.time.Instant;
import java.util.UUID;

public record Claim(
    UUID id,
    UUID paperId,
    UUID sourceChunkId,
    String normalizedText,
    String sourceText,
    ClaimType claimType,
    ProvenanceType provenanceType,
    double extractionConfidence,
    String sectionName,
    Integer pageNumber,
    UUID createdBy,
    Instant createdAt,
    Instant updatedAt
) {}
