package com.airesearch.discovery.scholarly.dto;

import java.util.UUID;

public record ScholarlyImportResult(
    UUID paperId,
    String title,
    String doi,
    String processingStatus,
    String accessStatus,
    String documentPath,
    String attribution,
    String message
) {}
