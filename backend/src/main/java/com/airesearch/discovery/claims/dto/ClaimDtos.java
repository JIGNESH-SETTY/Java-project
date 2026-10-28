package com.airesearch.discovery.claims.dto;

import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.shared.enums.ClaimType;
import com.airesearch.discovery.shared.enums.RelationType;
import com.airesearch.discovery.shared.enums.ReviewStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public class ClaimDtos {

    public record CreateClaimRequest(
            UUID paperId,
            UUID sourceChunkId,
            @NotBlank(message = "Normalized claim text is required")
            String normalizedText,
            @NotBlank(message = "Source text is required")
            String sourceText,
            @NotNull(message = "Claim type is required")
            ClaimType claimType,
            String sectionName,
            Integer pageNumber
    ) {}

    public record UpdateClaimRequest(
            String normalizedText,
            String sourceText,
            ClaimType claimType,
            String sectionName,
            Integer pageNumber
    ) {}

    public record CreateRelationRequest(
            @NotNull(message = "Target claim ID is required")
            UUID targetClaimId,
            @NotNull(message = "Relation type is required")
            RelationType relationType,
            Double confidence,
            @NotBlank(message = "Rationale is required")
            String rationale,
            List<UUID> evidenceChunkIds
    ) {}

    public record UpdateReviewStatusRequest(
            @NotNull(message = "Review status is required")
            ReviewStatus reviewStatus
    ) {}

    public record ClaimDetailDto(
            Claim claim,
            String paperTitle,
            List<ClaimRelation> relations
    ) {}
}
