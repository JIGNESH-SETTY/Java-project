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
public class OpenAlexSourceProvider implements ScholarlySourceProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAlexSourceProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String mailto;

    public OpenAlexSourceProvider(
            @Value("${app.scholarly.openalex.mailto:researcher@airesearch.edu}") String mailto,
            @Value("${app.scholarly.openalex.api-key:}") String apiKey,
            ObjectMapper objectMapper) {
        this.mailto = mailto;
        this.objectMapper = objectMapper;
        var builder = RestClient.builder()
                .baseUrl("https://api.openalex.org")
                .defaultHeader("User-Agent", "AIResearchDiscoveryEngine/1.0 (mailto:" + mailto + ")");
        if (apiKey != null && !apiKey.isBlank()) {
            builder.defaultHeader("api_key", apiKey);
        }
        this.restClient = builder.build();
    }

    @Override
    public String getProviderName() {
        return "OpenAlex";
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
            String url = "/works?search=" + encoded + "&per_page=" + limit + "&mailto=" + URLEncoder.encode(mailto, StandardCharsets.UTF_8);

            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                return new SourceSearchResult(getProviderName(), query, 0, List.of());
            }

            JsonNode root = objectMapper.readTree(response);
            int total = root.path("meta").path("count").asInt(0);
            JsonNode results = root.path("results");

            List<PaperMetadata> papers = new ArrayList<>();
            if (results.isArray()) {
                for (JsonNode item : results) {
                    papers.add(mapWorkToMetadata(item));
                }
            }
            return new SourceSearchResult(getProviderName(), query, total, papers);
        } catch (Exception e) {
            log.warn("OpenAlex search failed for query [{}]: {}", query, e.getMessage());
            return new SourceSearchResult(getProviderName(), query, 0, List.of());
        }
    }

    @Override
    public PaperMetadata resolveByDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        String cleanDoi = cleanDoi(doi);
        try {
            String url = "/works/https://doi.org/" + cleanDoi + "?mailto=" + URLEncoder.encode(mailto, StandardCharsets.UTF_8);
            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) return null;
            JsonNode item = objectMapper.readTree(response);
            return mapWorkToMetadata(item);
        } catch (Exception e) {
            log.warn("OpenAlex resolve DOI failed for [{}]: {}", cleanDoi, e.getMessage());
            return null;
        }
    }

    @Override
    public PaperMetadata resolveByExternalId(String externalId) {
        if (externalId == null || externalId.isBlank()) return null;
        try {
            String id = externalId.startsWith("http") ? externalId : "https://openalex.org/" + externalId;
            String encodedId = URLEncoder.encode(id, StandardCharsets.UTF_8);
            String url = "/works/" + encodedId + "?mailto=" + URLEncoder.encode(mailto, StandardCharsets.UTF_8);
            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) return null;
            JsonNode item = objectMapper.readTree(response);
            return mapWorkToMetadata(item);
        } catch (Exception e) {
            log.warn("OpenAlex resolve external ID failed for [{}]: {}", externalId, e.getMessage());
            return null;
        }
    }

    @Override
    public Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata) {
        if (metadata == null || metadata.openAccessPdfUrl() == null || metadata.openAccessPdfUrl().isBlank()) {
            return Optional.empty();
        }
        try {
            // Validate that OA status is confirmed
            if (!"OPEN_ACCESS".equalsIgnoreCase(metadata.accessStatus())) {
                return Optional.empty();
            }
            byte[] bytes = restClient.get()
                    .uri(metadata.openAccessPdfUrl())
                    .retrieve()
                    .body(byte[].class);

            if (bytes != null && bytes.length > 1000) {
                return Optional.of(new OpenAccessDocument(
                        metadata.openAccessPdfUrl(),
                        "application/pdf",
                        metadata.licenseName(),
                        getProviderName(),
                        bytes
                ));
            }
        } catch (Exception e) {
            log.warn("Failed to download Open Access PDF from [{}]: {}", metadata.openAccessPdfUrl(), e.getMessage());
        }
        return Optional.empty();
    }

    private PaperMetadata mapWorkToMetadata(JsonNode item) {
        String title = item.path("title").asText("");
        if (title.isBlank()) {
            title = item.path("display_name").asText("Untitled Document");
        }

        List<String> authors = new ArrayList<>();
        JsonNode authorships = item.path("authorships");
        if (authorships.isArray()) {
            for (JsonNode auth : authorships) {
                String name = auth.path("author").path("display_name").asText("");
                if (!name.isBlank()) authors.add(name);
            }
        }

        Integer year = item.has("publication_year") ? item.get("publication_year").asInt() : null;

        String venue = "";
        JsonNode primaryLoc = item.path("primary_location");
        if (primaryLoc.has("source") && !primaryLoc.path("source").isNull()) {
            venue = primaryLoc.path("source").path("display_name").asText("");
        }

        String rawDoi = item.path("doi").asText(null);
        String doi = cleanDoi(rawDoi);

        String openAlexId = item.path("id").asText("");
        int citations = item.path("cited_by_count").asInt(0);

        // Open Access details
        JsonNode oa = item.path("open_access");
        boolean isOa = oa.path("is_oa").asBoolean(false);
        String oaUrl = oa.path("oa_url").asText(null);
        String accessStatus = isOa ? "OPEN_ACCESS" : "RESTRICTED";
        String license = primaryLoc.path("license").asText(null);

        // If primary location has pdf_url and it is open access, prefer pdf_url
        String pdfUrl = primaryLoc.path("pdf_url").asText(null);
        if (pdfUrl != null && !pdfUrl.isBlank() && isOa) {
            oaUrl = pdfUrl;
        }

        // Reconstruct abstract from inverted index if present
        String abstractText = reconstructAbstract(item.path("abstract_inverted_index"));

        Map<String, String> externalIds = new HashMap<>();
        if (doi != null) externalIds.put("DOI", doi);
        if (!openAlexId.isBlank()) externalIds.put("OpenAlex", openAlexId);

        return new PaperMetadata(
                title,
                authors,
                abstractText,
                doi,
                year,
                venue,
                getProviderName(),
                openAlexId,
                openAlexId,
                externalIds,
                oaUrl,
                accessStatus,
                license,
                citations,
                "Metadata & Open-Access location from OpenAlex official API"
        );
    }

    private String reconstructAbstract(JsonNode invertedIndex) {
        if (invertedIndex == null || invertedIndex.isMissingNode() || !invertedIndex.isObject()) {
            return null;
        }
        try {
            TreeMap<Integer, String> wordPositions = new TreeMap<>();
            var fields = invertedIndex.fields();
            while (fields.hasNext()) {
                var entry = fields.next();
                String word = entry.getKey();
                JsonNode positions = entry.getValue();
                if (positions.isArray()) {
                    for (JsonNode pos : positions) {
                        wordPositions.put(pos.asInt(), word);
                    }
                }
            }
            if (wordPositions.isEmpty()) return null;
            return String.join(" ", wordPositions.values());
        } catch (Exception e) {
            return null;
        }
    }

    private String cleanDoi(String raw) {
        if (raw == null) return null;
        return raw.trim()
                .replace("https://doi.org/", "")
                .replace("http://doi.org/", "")
                .replace("doi:", "");
    }
}
