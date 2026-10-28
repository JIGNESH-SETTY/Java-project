package com.airesearch.discovery.scholarly.dto;

import com.airesearch.discovery.scholarly.model.PaperMetadata;
import java.util.List;

public record SourceSearchResult(
    String provider,
    String query,
    int totalEstimatedResults,
    List<PaperMetadata> papers
) {}
