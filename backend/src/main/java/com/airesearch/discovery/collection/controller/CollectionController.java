package com.airesearch.discovery.collection.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.collection.dto.CollectionDtos.*;
import com.airesearch.discovery.collection.service.CollectionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collections")
@Tag(name = "Collections", description = "Endpoints for managing user paper collections and bibliographies")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @PostMapping
    @Operation(summary = "Create a new research paper collection")
    public ResponseEntity<CollectionDetailDto> createCollection(
            @Valid @RequestBody CreateCollectionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        CollectionDetailDto created = collectionService.createCollection(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List all collections belonging to current user")
    public ResponseEntity<List<CollectionDetailDto>> listCollections(@AuthenticationPrincipal UserPrincipal principal) {
        List<CollectionDetailDto> list = collectionService.listCollections(principal.getId());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get collection details and paper list")
    public ResponseEntity<CollectionDetailDto> getCollection(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        CollectionDetailDto dto = collectionService.getCollectionDetail(id, principal.getId());
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update collection name or description")
    public ResponseEntity<CollectionDetailDto> updateCollection(
            @PathVariable UUID id,
            @RequestBody UpdateCollectionRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        CollectionDetailDto dto = collectionService.updateCollection(id, request, principal.getId());
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a collection")
    public ResponseEntity<Void> deleteCollection(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        collectionService.deleteCollection(id, principal.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{collectionId}/papers/{paperId}")
    @Operation(summary = "Add a paper to a collection")
    public ResponseEntity<Void> addPaperToCollection(
            @PathVariable UUID collectionId,
            @PathVariable UUID paperId,
            @AuthenticationPrincipal UserPrincipal principal) {

        collectionService.addPaper(collectionId, paperId, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{collectionId}/papers/{paperId}")
    @Operation(summary = "Remove a paper from a collection")
    public ResponseEntity<Void> removePaperFromCollection(
            @PathVariable UUID collectionId,
            @PathVariable UUID paperId,
            @AuthenticationPrincipal UserPrincipal principal) {

        collectionService.removePaper(collectionId, paperId, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
