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
public class CrossrefSourceProvider implements ScholarlySourceProvider {

    private static final Logger log = LoggerFactory.getLogger(CrossrefSourceProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String mailto;

    public CrossrefSourceProvider(
            @Value("${app.scholarly.crossref.mailto:researcher@airesearch.edu}") String mailto,
            ObjectMapper objectMapper) {
        this.mailto = mailto;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.crossref.org")
                .defaultHeader("User-Agent", "AIResearchDiscoveryEngine/1.0 (mailto:" + mailto + ")")
                .build();
    }

    @Override
    public String getProviderName() {
        return "Crossref";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public SourceSearchResult search(String query, SourceSearchOptions options) {
        int limit = options != null && options.limit() > 0 ? Math.min(options.limit(), 25) : 10;
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String response = restClient.get()
                    .uri("/works?query=" + encoded + "&rows=" + limit)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                return new SourceSearchResult(getProviderName(), query, 0, List.of());
            }

            JsonNode root = objectMapper.readTree(response);
            JsonNode message = root.path("message");
            int total = message.path("total-results").asInt(0);
            JsonNode items = message.path("items");

            List<PaperMetadata> papers = new ArrayList<>();
            if (items.isArray()) {
                for (JsonNode item : items) {
                    papers.add(mapItemToMetadata(item));
                }
            }
            return new SourceSearchResult(getProviderName(), query, total, papers);
        } catch (Exception e) {
            log.warn("Crossref search failed for query [{}]: {}", query, e.getMessage());
            return new SourceSearchResult(getProviderName(), query, 0, List.of());
        }
    }

    @Override
    public PaperMetadata resolveByDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        String cleanDoi = cleanDoi(doi);
        try {
            String response = restClient.get()
                    .uri("/works/" + cleanDoi)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) return null;
            JsonNode root = objectMapper.readTree(response);
            JsonNode item = root.path("message");
            return mapItemToMetadata(item);
        } catch (Exception e) {
            log.warn("Crossref resolve DOI failed for [{}]: {}", cleanDoi, e.getMessage());
            return null;
        }
    }

    @Override
    public PaperMetadata resolveByExternalId(String externalId) {
        return resolveByDoi(externalId);
    }

    @Override
    public Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata) {
        return Optional.empty(); // Crossref provides bibliographic metadata; open access documents are resolved via OpenAlex, Unpaywall, or arXiv
    }

    private PaperMetadata mapItemToMetadata(JsonNode item) {
        String title = "";
        if (item.has("title") && item.get("title").isArray() && !item.get("title").isEmpty()) {
            title = item.get("title").get(0).asText("");
        }

        List<String> authors = new ArrayList<>();
        if (item.has("author") && item.get("author").isArray()) {
            for (JsonNode a : item.get("author")) {
                String given = a.path("given").asText("");
                String family = a.path("family").asText("");
                String name = (given + " " + family).trim();
                if (!name.isBlank()) authors.add(name);
            }
        }

        String doi = item.path("DOI").asText(null);
        String venue = "";
        if (item.has("container-title") && item.get("container-title").isArray() && !item.get("container-title").isEmpty()) {
            venue = item.get("container-title").get(0).asText("");
        } else if (item.has("publisher")) {
            venue = item.get("publisher").asText("");
        }

        Integer year = null;
        if (item.has("published") && item.get("published").has("date-parts")) {
            JsonNode parts = item.get("published").get("date-parts");
            if (parts.isArray() && !parts.isEmpty() && parts.get(0).isArray() && !parts.get(0).isEmpty()) {
                year = parts.get(0).get(0).asInt();
            }
        }

        String abs = item.path("abstract").asText(null);
        if (abs != null) {
            abs = abs.replaceAll("<[^>]*>", "").trim();
        }

        int citationCount = item.path("is-referenced-by-count").asInt(0);

        Map<String, String> externalIds = new HashMap<>();
        if (doi != null) externalIds.put("DOI", doi);

        return new PaperMetadata(
                title,
                authors,
                abs,
                doi,
                year,
                venue,
                getProviderName(),
                doi,
                doi != null ? "https://doi.org/" + doi : null,
                externalIds,
                null,
                "UNKNOWN",
                null,
                citationCount,
                "Metadata from Crossref official API"
        );
    }

    private String cleanDoi(String raw) {
        return raw.trim()
                .replace("https://doi.org/", "")
                .replace("http://doi.org/", "")
                .replace("doi:", "");
    }
}
