package com.airesearch.discovery.search.dto;

import java.util.List;
import java.util.UUID;

public record SearchResultDto(
    UUID chunkId,
    UUID paperId,
    String paperTitle,
    Integer publicationYear,
    String venue,
    List<String> authors,
    String sectionName,
    Integer pageNumber,
    int chunkIndex,
    String snippet,
    double combinedScore,
    double semanticScore,
    double lexicalScore,
    String scoringRationale
) {}
