package com.airesearch.discovery.claims.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.claims.dto.ClaimDtos.UpdateReviewStatusRequest;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.service.ClaimService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/claim-relations")
@Tag(name = "Claim Relations", description = "Review and explore relationships across research claims")
public class ClaimRelationController {

    private final ClaimService claimService;

    public ClaimRelationController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @GetMapping
    @Operation(summary = "List all proposed and confirmed claim relationships")
    public ResponseEntity<List<ClaimRelation>> listRelations(@AuthenticationPrincipal UserPrincipal principal) {
        List<ClaimRelation> list = claimService.listRelations(principal.getId());
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/review-status")
    @Operation(summary = "Confirm or reject an AI-proposed or human-asserted claim relationship")
    public ResponseEntity<Void> updateReviewStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateReviewStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        claimService.updateRelationReviewStatus(id, request.reviewStatus(), principal.getId());
        return ResponseEntity.noContent().build();
    }
}
