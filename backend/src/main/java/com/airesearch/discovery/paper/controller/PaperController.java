package com.airesearch.discovery.paper.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.ingestion.model.IngestionJob;
import com.airesearch.discovery.ingestion.service.IngestionService;
import com.airesearch.discovery.paper.dto.ManualPaperRequest;
import com.airesearch.discovery.paper.dto.PaperDetailDto;
import com.airesearch.discovery.paper.dto.PaperSummaryDto;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.service.PaperService;
import com.airesearch.discovery.shared.enums.PaperVisibility;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/papers")
@Tag(name = "Papers", description = "Endpoints for paper ingestion, cataloging, chunks, and metadata")
public class PaperController {

    private final PaperService paperService;
    private final IngestionService ingestionService;

    public PaperController(PaperService paperService, IngestionService ingestionService) {
        this.paperService = paperService;
        this.ingestionService = ingestionService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a PDF research paper for automated extraction and vector embedding")
    public ResponseEntity<IngestionService.IngestionResponse> uploadPaper(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "visibility", required = false, defaultValue = "PRIVATE") PaperVisibility visibility,
            @AuthenticationPrincipal UserPrincipal principal) {

        IngestionService.IngestionResponse response = ingestionService.startUploadIngestion(file, principal.getId(), visibility);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/manual")
    @Operation(summary = "Create a manual paper entry without uploading a PDF")
    public ResponseEntity<Paper> createManualPaper(
            @Valid @RequestBody ManualPaperRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        Paper created = paperService.createManualPaper(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List all papers accessible to current user (owned + public)")
    public ResponseEntity<List<PaperSummaryDto>> listPapers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<PaperSummaryDto> papers = paperService.listPapers(principal.getId(), page, size);
        return ResponseEntity.ok(papers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get comprehensive details of a paper including chunks, claims, authors, and references")
    public ResponseEntity<PaperDetailDto> getPaperDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        PaperDetailDto detail = paperService.getPaperDetail(id, principal.getId());
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/{id}/chunks")
    @Operation(summary = "Get all text chunks with section and page offsets for a paper")
    public ResponseEntity<List<DocumentChunk>> getPaperChunks(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<DocumentChunk> chunks = paperService.getPaperChunks(id, principal.getId());
        return ResponseEntity.ok(chunks);
    }

    @GetMapping("/{id}/claims")
    @Operation(summary = "Get all reported scientific claims extracted from a paper")
    public ResponseEntity<List<Claim>> getPaperClaims(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<Claim> claims = paperService.getPaperClaims(id, principal.getId());
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}/ingestion-status")
    @Operation(summary = "Check background ingestion pipeline job status for a paper")
    public ResponseEntity<IngestionJob> getIngestionStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        return paperService.getIngestionStatus(id, principal.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an uploaded paper (owner only)")
    public ResponseEntity<Void> deletePaper(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        paperService.deletePaper(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
