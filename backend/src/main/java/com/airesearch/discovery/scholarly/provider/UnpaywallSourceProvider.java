package com.airesearch.discovery.scholarly.provider;

import com.airesearch.discovery.scholarly.dto.SourceSearchOptions;
import com.airesearch.discovery.scholarly.dto.SourceSearchResult;
import com.airesearch.discovery.scholarly.model.OpenAccessDocument;
import com.airesearch.discovery.scholarly.model.PaperMetadata;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class UnpaywallSourceProvider implements ScholarlySourceProvider {

    private static final Logger log = LoggerFactory.getLogger(UnpaywallSourceProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String email;

    public UnpaywallSourceProvider(
            @Value("${app.scholarly.unpaywall.email:researcher@airesearch.edu}") String email,
            ObjectMapper objectMapper) {
        this.email = email;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.unpaywall.org/v2")
                .defaultHeader("User-Agent", "AIResearchDiscoveryEngine/1.0 (mailto:" + email + ")")
                .build();
    }

    @Override
    public String getProviderName() {
        return "Unpaywall";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public SourceSearchResult search(String query, SourceSearchOptions options) {
        // Unpaywall is primarily a DOI lookup service for legal open access locations
        return new SourceSearchResult(getProviderName(), query, 0, List.of());
    }

    @Override
    public PaperMetadata resolveByDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        try {
            String cleanDoi = doi.trim().replace("https://doi.org/", "").replace("http://doi.org/", "");
            String url = "/" + cleanDoi + "?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8);

            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) return null;
            JsonNode root = objectMapper.readTree(response);

            String title = root.path("title").asText("");
            String publishedDoi = root.path("doi").asText(cleanDoi);
            Integer year = root.has("year") ? root.path("year").asInt() : null;
            String venue = root.path("journal_name").asText("");

            boolean isOa = root.path("is_oa").asBoolean(false);
            JsonNode bestOa = root.path("best_oa_location");
            String pdfUrl = null;
            String license = null;
            if (bestOa.isObject()) {
                pdfUrl = bestOa.path("url_for_pdf").asText(null);
                if (pdfUrl == null || pdfUrl.isBlank()) {
                    pdfUrl = bestOa.path("url").asText(null);
                }
                license = bestOa.path("license").asText(null);
            }

            Map<String, String> externalIds = new HashMap<>();
            externalIds.put("DOI", publishedDoi);

            return new PaperMetadata(
                    title,
                    List.of(),
                    null,
                    publishedDoi,
                    year,
                    venue,
                    getProviderName(),
                    publishedDoi,
                    "https://doi.org/" + publishedDoi,
                    externalIds,
                    pdfUrl,
                    isOa ? "OPEN_ACCESS" : "RESTRICTED",
                    license,
                    0,
                    "Legal Open-Access discovery from Unpaywall official API"
            );
        } catch (Exception e) {
            log.warn("Unpaywall lookup failed for DOI [{}]: {}", doi, e.getMessage());
            return null;
        }
    }

    @Override
    public PaperMetadata resolveByExternalId(String externalId) {
        return resolveByDoi(externalId);
    }

    @Override
    public Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata) {
        return Optional.empty();
    }
}
