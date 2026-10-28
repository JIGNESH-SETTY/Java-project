package com.airesearch.discovery.annotation.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.UUID;

public class AnnotationDtos {

    public record CreateAnnotationRequest(
            UUID paperId,
            UUID chunkId,
            UUID claimId,
            @NotBlank(message = "Annotation body is required")
            String body,
            String annotationType // NOTE, CRITIQUE, QUESTION, HIGHLIGHT
    ) {}

    public record UpdateAnnotationRequest(
            @NotBlank(message = "Annotation body is required")
            String body
    ) {}

    public record AnnotationDto(
            UUID id,
            UUID userId,
            UUID paperId,
            UUID chunkId,
            UUID claimId,
            String body,
            String annotationType,
            Instant createdAt,
            Instant updatedAt
    ) {}
}
