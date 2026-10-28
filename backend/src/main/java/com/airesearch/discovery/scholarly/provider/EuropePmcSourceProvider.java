package com.airesearch.discovery.scholarly.provider;

import com.airesearch.discovery.scholarly.dto.SourceSearchOptions;
import com.airesearch.discovery.scholarly.dto.SourceSearchResult;
import com.airesearch.discovery.scholarly.model.OpenAccessDocument;
import com.airesearch.discovery.scholarly.model.PaperMetadata;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class EuropePmcSourceProvider implements ScholarlySourceProvider {

    private static final Logger log = LoggerFactory.getLogger(EuropePmcSourceProvider.class);
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public EuropePmcSourceProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl("https://www.ebi.ac.uk/europepmc/webservices/rest")
                .defaultHeader("User-Agent", "AIResearchDiscoveryEngine/1.0")
                .build();
    }

    @Override
    public String getProviderName() {
        return "Europe PMC";
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
            String url = "/search?query=" + encoded + "&format=json&pageSize=" + limit;

            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                return new SourceSearchResult(getProviderName(), query, 0, List.of());
            }

            JsonNode root = objectMapper.readTree(response);
            int hitCount = root.path("hitCount").asInt(0);
            JsonNode resultList = root.path("resultList").path("result");

            List<PaperMetadata> papers = new ArrayList<>();
            if (resultList.isArray()) {
                for (JsonNode item : resultList) {
                    papers.add(mapResult(item));
                }
            }
            return new SourceSearchResult(getProviderName(), query, hitCount, papers);
        } catch (Exception e) {
            log.warn("Europe PMC search failed for query [{}]: {}", query, e.getMessage());
            return new SourceSearchResult(getProviderName(), query, 0, List.of());
        }
    }

    @Override
    public PaperMetadata resolveByDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        try {
            String encoded = URLEncoder.encode("DOI:\"" + doi + "\"", StandardCharsets.UTF_8);
            String url = "/search?query=" + encoded + "&format=json&pageSize=1";
            String response = restClient.get().uri(url).retrieve().body(String.class);
            if (response == null) return null;
            JsonNode root = objectMapper.readTree(response);
            JsonNode resultList = root.path("resultList").path("result");
            if (resultList.isArray() && !resultList.isEmpty()) {
                return mapResult(resultList.get(0));
            }
        } catch (Exception e) {
            log.warn("Europe PMC resolve DOI failed: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public PaperMetadata resolveByExternalId(String externalId) {
        if (externalId == null || externalId.isBlank()) return null;
        try {
            String encoded = URLEncoder.encode("EXT_ID:" + externalId, StandardCharsets.UTF_8);
            String url = "/search?query=" + encoded + "&format=json&pageSize=1";
            String response = restClient.get().uri(url).retrieve().body(String.class);
            if (response == null) return null;
            JsonNode root = objectMapper.readTree(response);
            JsonNode resultList = root.path("resultList").path("result");
            if (resultList.isArray() && !resultList.isEmpty()) {
                return mapResult(resultList.get(0));
            }
        } catch (Exception e) {
            log.warn("Europe PMC resolve ID failed: {}", e.getMessage());
        }
        return null;
    }

    @Override
    public Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata) {
        return Optional.empty();
    }

    private PaperMetadata mapResult(JsonNode item) {
        String title = item.path("title").asText("");
        String authorString = item.path("authorString").asText("");
        List<String> authors = new ArrayList<>();
        if (!authorString.isBlank()) {
            for (String a : authorString.split(",")) {
                String clean = a.trim();
                if (!clean.isBlank()) authors.add(clean);
            }
        }

        String doi = item.path("doi").asText(null);
        String pmcid = item.path("pmcid").asText(null);
        String pmid = item.path("pmid").asText(null);
        String journal = item.path("journalTitle").asText("");
        Integer year = item.has("pubYear") ? item.path("pubYear").asInt() : null;
        String abstractText = item.path("abstractText").asText(null);
        int citations = item.path("citedByCount").asInt(0);

        boolean isOa = "Y".equalsIgnoreCase(item.path("isOpenAccess").asText("N"));
        String pdfUrl = null;
        if (isOa && pmcid != null) {
            pdfUrl = "https://www.ncbi.nlm.nih.gov/pmc/articles/" + pmcid + "/pdf/";
        }

        Map<String, String> externalIds = new HashMap<>();
        if (doi != null) externalIds.put("DOI", doi);
        if (pmcid != null) externalIds.put("PMCID", pmcid);
        if (pmid != null) externalIds.put("PMID", pmid);

        return new PaperMetadata(
                title,
                authors,
                abstractText,
                doi,
                year,
                journal,
                getProviderName(),
                pmcid != null ? pmcid : pmid,
                doi != null ? "https://doi.org/" + doi : null,
                externalIds,
                pdfUrl,
                isOa ? "OPEN_ACCESS" : "RESTRICTED",
                null,
                citations,
                "Biomedical literature from Europe PMC official API"
        );
    }
}
