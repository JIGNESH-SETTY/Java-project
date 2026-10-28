package com.airesearch.discovery.ingestion.model;

import com.airesearch.discovery.shared.enums.JobStatus;
import java.time.Instant;
import java.util.UUID;

public record IngestionJob(
    UUID id,
    UUID paperId,
    JobStatus status,
    String currentStage,
    String warningMessage,
    String errorMessage,
    Instant startedAt,
    Instant completedAt
) {}
