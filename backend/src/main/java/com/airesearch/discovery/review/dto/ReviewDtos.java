package com.airesearch.discovery.review.dto;

import com.airesearch.discovery.shared.enums.EvidenceRole;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class ReviewDtos {

    public record GenerateReviewRequest(
            @NotBlank(message = "Review topic or question is required")
            String query,
            List<UUID> paperIds,
            UUID collectionId,
            String scope,
            String customOutline
    ) {}

    public record ReviewEvidenceItem(
            UUID id,
            int paragraphIndex,
            UUID chunkId,
            UUID paperId,
            String paperTitle,
            Integer pageNumber,
            String sectionName,
            String snippet,
            String citationLabel,
            EvidenceRole evidenceRole
    ) {}

    public record ReviewDetailDto(
            UUID id,
            String query,
            String title,
            String contentMarkdown,
            String modelName,
            String status,
            String coverageWarning,
            Instant createdAt,
            List<ReviewEvidenceItem> evidence
    ) {}

    public record ReviewSummaryDto(
            UUID id,
            String query,
            String title,
            String modelName,
            String status,
            Instant createdAt,
            int evidenceCount
    ) {}
}
