package com.airesearch.discovery.scholarly.model;

import java.time.Instant;
import java.util.UUID;

public record PaperAccessLink(
    UUID id,
    UUID paperId,
    String url,
    String linkType,
    String accessStatus,
    String licenseName,
    String sourceProvider,
    Instant checkedAt
) {}
