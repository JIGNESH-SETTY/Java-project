package com.airesearch.discovery.paper.model;

import com.airesearch.discovery.shared.enums.PaperVisibility;
import java.time.Instant;
import java.util.UUID;

public record Paper(
    UUID id,
    UUID ownerId,
    String title,
    String abstractText,
    String doi,
    Integer publicationYear,
    String venue,
    String documentPath,
    String processingStatus,
    String processingError,
    PaperVisibility visibility,
    Instant createdAt,
    Instant updatedAt
) {}
