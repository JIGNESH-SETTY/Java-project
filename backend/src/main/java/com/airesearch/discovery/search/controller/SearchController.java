package com.airesearch.discovery.search.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.search.dto.SearchRequest;
import com.airesearch.discovery.search.dto.SearchResultDto;
import com.airesearch.discovery.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
@Tag(name = "Search", description = "Hybrid lexical and semantic retrieval across papers and chunks")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @PostMapping
    @Operation(summary = "Execute hybrid, semantic, or lexical search with metadata filtering")
    public ResponseEntity<List<SearchResultDto>> search(
            @RequestBody SearchRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<SearchResultDto> results = searchService.search(request, principal.getId());
        return ResponseEntity.ok(results);
    }
}
