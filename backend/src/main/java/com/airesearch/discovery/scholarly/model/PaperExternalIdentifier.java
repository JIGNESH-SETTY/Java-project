package com.airesearch.discovery.scholarly.model;

import java.time.Instant;
import java.util.UUID;

public record PaperExternalIdentifier(
    UUID id,
    UUID paperId,
    String provider,
    String externalId,
    String externalUrl,
    String canonicalDoi,
    String metadataSource,
    Instant importedAt
) {}
