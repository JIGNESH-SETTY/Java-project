package com.airesearch.discovery.scholarly.model;

import java.util.List;
import java.util.Map;

public record PaperMetadata(
    String title,
    List<String> authors,
    String abstractText,
    String doi,
    Integer publicationYear,
    String venue,
    String provider,
    String externalId,
    String externalUrl,
    Map<String, String> externalIds,
    String openAccessPdfUrl,
    String accessStatus, // OPEN_ACCESS, RESTRICTED, UNKNOWN
    String licenseName,
    Integer citationCount,
    String metadataSource
) {
    public boolean hasOpenAccessPdf() {
        return openAccessPdfUrl != null && !openAccessPdfUrl.isBlank() && !"RESTRICTED".equalsIgnoreCase(accessStatus);
    }
}
