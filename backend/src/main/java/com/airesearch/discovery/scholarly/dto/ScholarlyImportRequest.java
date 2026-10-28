package com.airesearch.discovery.scholarly.dto;

import com.airesearch.discovery.scholarly.model.PaperMetadata;

public record ScholarlyImportRequest(
    PaperMetadata metadata,
    boolean downloadOpenAccessPdfIfAvailable
) {}
