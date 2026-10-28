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
public class SemanticScholarSourceProvider implements ScholarlySourceProvider {

    private static final Logger log = LoggerFactory.getLogger(SemanticScholarSourceProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public SemanticScholarSourceProvider(
            @Value("${app.scholarly.semanticscholar.api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        var builder = RestClient.builder()
                .baseUrl("https://api.semanticscholar.org/graph/v1")
                .defaultHeader("User-Agent", "AIResearchDiscoveryEngine/1.0");
        if (apiKey != null && !apiKey.isBlank()) {
            builder.defaultHeader("x-api-key", apiKey);
        }
        this.restClient = builder.build();
    }

    @Override
    public String getProviderName() {
        return "Semantic Scholar";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public SourceSearchResult search(String query, SourceSearchOptions options) {
        int limit = options != null && options.limit() > 0 ? Math.min(options.limit(), 20) : 10;
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "/paper/search?query=" + encoded + "&limit=" + limit + "&fields=title,authors,year,venue,abstract,openAccessPdf,citationCount,externalIds";

            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                return new SourceSearchResult(getProviderName(), query, 0, List.of());
            }

            JsonNode root = objectMapper.readTree(response);
            int total = root.path("total").asInt(0);
            JsonNode data = root.path("data");

            List<PaperMetadata> papers = new ArrayList<>();
            if (data.isArray()) {
                for (JsonNode item : data) {
                    papers.add(mapItem(item));
                }
            }
            return new SourceSearchResult(getProviderName(), query, total, papers);
        } catch (Exception e) {
            log.warn("Semantic Scholar search failed for query [{}]: {}", query, e.getMessage());
            return new SourceSearchResult(getProviderName(), query, 0, List.of());
        }
    }

    @Override
    public PaperMetadata resolveByDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        try {
            String url = "/paper/DOI:" + doi + "?fields=title,authors,year,venue,abstract,openAccessPdf,citationCount,externalIds";
            String response = restClient.get().uri(url).retrieve().body(String.class);
            if (response == null) return null;
            return mapItem(objectMapper.readTree(response));
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public PaperMetadata resolveByExternalId(String externalId) {
        if (externalId == null || externalId.isBlank()) return null;
        try {
            String url = "/paper/" + externalId + "?fields=title,authors,year,venue,abstract,openAccessPdf,citationCount,externalIds";
            String response = restClient.get().uri(url).retrieve().body(String.class);
            if (response == null) return null;
            return mapItem(objectMapper.readTree(response));
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata) {
        return Optional.empty();
    }

    private PaperMetadata mapItem(JsonNode item) {
        String title = item.path("title").asText("");
        List<String> authors = new ArrayList<>();
        JsonNode authNodes = item.path("authors");
        if (authNodes.isArray()) {
            for (JsonNode a : authNodes) {
                String name = a.path("name").asText("");
                if (!name.isBlank()) authors.add(name);
            }
        }

        Integer year = item.has("year") && !item.get("year").isNull() ? item.get("year").asInt() : null;
        String venue = item.path("venue").asText("");
        String abstractText = item.path("abstract").asText(null);
        int citations = item.path("citationCount").asInt(0);

        String paperId = item.path("paperId").asText("");
        JsonNode ext = item.path("externalIds");
        String doi = ext.path("DOI").asText(null);
        String arxiv = ext.path("ArXiv").asText(null);

        Map<String, String> externalIds = new HashMap<>();
        if (!paperId.isBlank()) externalIds.put("SemanticScholar", paperId);
        if (doi != null) externalIds.put("DOI", doi);
        if (arxiv != null) externalIds.put("arXiv", arxiv);

        String pdfUrl = null;
        String accessStatus = "UNKNOWN";
        JsonNode oaPdf = item.path("openAccessPdf");
        if (oaPdf.has("url")) {
            pdfUrl = oaPdf.path("url").asText(null);
            accessStatus = "OPEN_ACCESS";
        }

        return new PaperMetadata(
                title,
                authors,
                abstractText,
                doi,
                year,
                venue,
                getProviderName(),
                paperId,
                "https://www.semanticscholar.org/paper/" + paperId,
                externalIds,
                pdfUrl,
                accessStatus,
                null,
                citations,
                "Metadata from Semantic Scholar API"
        );
    }
}
