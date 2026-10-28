package com.airesearch.discovery.search.dto;

import java.util.UUID;

public record SearchRequest(
    String query,
    String searchMode, // HYBRID, SEMANTIC, LEXICAL
    Double semanticWeight, // 0.0 to 1.0 (default 0.7)
    Integer yearFrom,
    Integer yearTo,
    String author,
    String venue,
    UUID collectionId,
    Integer topK
) {
    public SearchRequest {
        if (searchMode == null || searchMode.isBlank()) searchMode = "HYBRID";
        if (semanticWeight == null) semanticWeight = 0.70;
        if (topK == null || topK <= 0) topK = 15;
    }
}
