package com.airesearch.discovery.comparison.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.comparison.dto.ComparisonRequest;
import com.airesearch.discovery.comparison.dto.ComparisonResponse.ComparisonResult;
import com.airesearch.discovery.comparison.service.ComparisonService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/compare")
@Tag(name = "Comparison", description = "Multi-paper structured comparison across methodology, datasets, and results")
public class ComparisonController {

    private final ComparisonService comparisonService;

    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    @PostMapping
    @Operation(summary = "Compare 2 to 5 papers across structured scientific aspects with linked evidence chunks")
    public ResponseEntity<ComparisonResult> comparePapers(
            @RequestBody ComparisonRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        ComparisonResult result = comparisonService.comparePapers(request, principal.getId());
        return ResponseEntity.ok(result);
    }
}
