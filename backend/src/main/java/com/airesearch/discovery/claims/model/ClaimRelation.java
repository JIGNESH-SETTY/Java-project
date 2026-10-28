package com.airesearch.discovery.claims.model;

import com.airesearch.discovery.shared.enums.ProvenanceType;
import com.airesearch.discovery.shared.enums.RelationType;
import com.airesearch.discovery.shared.enums.ReviewStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ClaimRelation(
    UUID id,
    UUID sourceClaimId,
    UUID targetClaimId,
    RelationType relationType,
    double confidence,
    String rationale,
    ProvenanceType provenanceType,
    ReviewStatus reviewStatus,
    UUID createdBy,
    Instant createdAt,
    Instant updatedAt,
    List<UUID> evidenceChunkIds
) {}
