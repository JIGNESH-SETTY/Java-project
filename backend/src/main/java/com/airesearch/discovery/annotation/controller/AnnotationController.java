package com.airesearch.discovery.annotation.controller;

import com.airesearch.discovery.annotation.dto.AnnotationDtos.*;
import com.airesearch.discovery.annotation.service.AnnotationService;
import com.airesearch.discovery.auth.security.UserPrincipal;
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
@RequestMapping("/api/v1/annotations")
@Tag(name = "Annotations", description = "User notes, critiques, and highlighted observations on papers and claims")
public class AnnotationController {

    private final AnnotationService annotationService;

    public AnnotationController(AnnotationService annotationService) {
        this.annotationService = annotationService;
    }

    @PostMapping
    @Operation(summary = "Create an annotation on a paper, chunk, or claim")
    public ResponseEntity<AnnotationDto> createAnnotation(
            @Valid @RequestBody CreateAnnotationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        AnnotationDto created = annotationService.createAnnotation(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "List annotations filtered by paper ID, claim ID, or current user")
    public ResponseEntity<List<AnnotationDto>> listAnnotations(
            @RequestParam(required = false) UUID paperId,
            @RequestParam(required = false) UUID claimId,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<AnnotationDto> list = annotationService.listAnnotations(paperId, claimId, principal.getId());
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an annotation body")
    public ResponseEntity<AnnotationDto> updateAnnotation(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAnnotationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        AnnotationDto updated = annotationService.updateAnnotation(id, request, principal.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an annotation")
    public ResponseEntity<Void> deleteAnnotation(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        annotationService.deleteAnnotation(id, principal.getId());
        return ResponseEntity.noContent().build();
    }
}
