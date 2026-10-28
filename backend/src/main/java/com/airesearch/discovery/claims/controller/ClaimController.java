package com.airesearch.discovery.claims.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.claims.dto.ClaimDtos.*;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.service.ClaimService;
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
@RequestMapping("/api/v1/claims")
@Tag(name = "Claims & Evidence", description = "Endpoints for scientific claims, evidence tracking, and cross-paper relations")
public class ClaimController {

    private final ClaimService claimService;

    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    @Operation(summary = "List scientific claims across accessible papers")
    public ResponseEntity<List<Claim>> listClaims(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal) {

        List<Claim> claims = claimService.listClaims(principal.getId(), page, size);
        return ResponseEntity.ok(claims);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed claim information including supporting evidence and related claims")
    public ResponseEntity<ClaimDetailDto> getClaimDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal) {

        ClaimDetailDto detail = claimService.getClaimDetail(id, principal.getId());
        return ResponseEntity.ok(detail);
    }

    @PostMapping
    @Operation(summary = "Assert a new scientific claim with source citation or note")
    public ResponseEntity<Claim> createClaim(
            @Valid @RequestBody CreateClaimRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        Claim created = claimService.createClaim(request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing claim")
    public ResponseEntity<Claim> updateClaim(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateClaimRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        Claim updated = claimService.updateClaim(id, request, principal.getId());
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/relations")
    @Operation(summary = "Propose or assert a relationship (SUPPORTS, CONTRADICTS, QUALIFIES, etc.) between claims")
    public ResponseEntity<ClaimRelation> createRelation(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRelationRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        ClaimRelation relation = claimService.createRelation(id, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(relation);
    }
}
