package com.airesearch.discovery.paper.model;

import java.time.Instant;
import java.util.UUID;

public record DocumentChunk(
    UUID id,
    UUID paperId,
    int chunkIndex,
    String sectionName,
    Integer pageNumber,
    int charStart,
    int charEnd,
    String content,
    int tokenCount,
    float[] embedding,
    String embeddingModel,
    Instant createdAt
) {}
