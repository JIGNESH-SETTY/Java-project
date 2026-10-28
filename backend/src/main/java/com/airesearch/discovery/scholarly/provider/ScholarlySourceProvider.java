package com.airesearch.discovery.scholarly.provider;

import com.airesearch.discovery.scholarly.dto.SourceSearchOptions;
import com.airesearch.discovery.scholarly.dto.SourceSearchResult;
import com.airesearch.discovery.scholarly.model.OpenAccessDocument;
import com.airesearch.discovery.scholarly.model.PaperMetadata;
import java.util.Optional;

public interface ScholarlySourceProvider {
    String getProviderName();
    boolean isAvailable();
    SourceSearchResult search(String query, SourceSearchOptions options);
    PaperMetadata resolveByDoi(String doi);
    PaperMetadata resolveByExternalId(String externalId);
    Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata);
}
