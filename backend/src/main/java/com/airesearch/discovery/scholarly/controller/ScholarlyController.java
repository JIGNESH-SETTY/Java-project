package com.airesearch.discovery.scholarly.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.scholarly.dto.ScholarlyImportRequest;
import com.airesearch.discovery.scholarly.dto.ScholarlyImportResult;
import com.airesearch.discovery.scholarly.dto.SourceSearchOptions;
import com.airesearch.discovery.scholarly.dto.SourceSearchResult;
import com.airesearch.discovery.scholarly.model.PaperAccessLink;
import com.airesearch.discovery.scholarly.model.PaperExternalIdentifier;
import com.airesearch.discovery.scholarly.model.PaperMetadata;
import com.airesearch.discovery.scholarly.service.ScholarlyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scholarly")
@Tag(name = "Scholarly Sources & Real Data", description = "Official API integrations for Crossref, OpenAlex, arXiv, Semantic Scholar, Unpaywall, and Europe PMC")
public class ScholarlyController {

    private final ScholarlyService scholarlyService;

    public ScholarlyController(ScholarlyService scholarlyService) {
        this.scholarlyService = scholarlyService;
    }

    @GetMapping("/providers")
    @Operation(summary = "List supported scholarly metadata and open-access providers")
    public ResponseEntity<List<String>> getProviders() {
        return ResponseEntity.ok(scholarlyService.getAvailableProviders());
    }

    @GetMapping("/search")
    @Operation(summary = "Search across scholarly providers (Crossref, OpenAlex, arXiv, Semantic Scholar, Europe PMC)")
    public ResponseEntity<List<SourceSearchResult>> searchSources(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "ALL") String provider,
            @RequestParam(required = false, defaultValue = "10") int limit,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false, defaultValue = "false") boolean openAccessOnly) {

        SourceSearchOptions options = new SourceSearchOptions(limit, yearFrom, yearTo, openAccessOnly);
        return ResponseEntity.ok(scholarlyService.searchAll(query, provider, options));
    }

    @GetMapping("/resolve/doi")
    @Operation(summary = "Resolve paper metadata and legal open-access location by DOI")
    public ResponseEntity<PaperMetadata> resolveDoi(@RequestParam String doi) {
        PaperMetadata metadata = scholarlyService.resolveDoi(doi);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(metadata);
    }

    @GetMapping("/resolve/external")
    @Operation(summary = "Resolve paper by provider name and external ID (e.g. arXiv ID)")
    public ResponseEntity<PaperMetadata> resolveExternal(
            @RequestParam String provider,
            @RequestParam String externalId) {
        PaperMetadata metadata = scholarlyService.resolveExternal(provider, externalId);
        if (metadata == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(metadata);
    }

    @PostMapping("/import")
    @Operation(summary = "Import canonical paper metadata and optionally download verified legal open-access full text")
    public ResponseEntity<ScholarlyImportResult> importPaper(
            @RequestBody ScholarlyImportRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UUID userId = principal.getId();
        ScholarlyImportResult result = scholarlyService.importPaper(request, userId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/papers/{paperId}/external-ids")
    @Operation(summary = "Get external identifiers and provider source attribution for a paper")
    public ResponseEntity<List<PaperExternalIdentifier>> getExternalIds(@PathVariable UUID paperId) {
        return ResponseEntity.ok(scholarlyService.getExternalIdentifiers(paperId));
    }

    @GetMapping("/papers/{paperId}/access-links")
    @Operation(summary = "Get legal access links, licenses, and open-access status for a paper")
    public ResponseEntity<List<PaperAccessLink>> getAccessLinks(@PathVariable UUID paperId) {
        return ResponseEntity.ok(scholarlyService.getAccessLinks(paperId));
    }
}
