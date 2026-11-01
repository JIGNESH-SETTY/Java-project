package com.airesearch.discovery.graph.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.graph.dto.GraphDtos.*;
import com.airesearch.discovery.graph.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/graphs")
@Tag(name = "Knowledge & Evidence Graphs", description = "Endpoints for bibliographic citation and concept-claim evidence graphs")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/citations")
    @Operation(summary = "Get filtered bibliographic citation network graph")
    public ResponseEntity<GraphResponse> getCitationGraph(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID collectionId,
            @RequestParam(required = false) UUID paperId,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) Boolean importedOnly,
            @RequestParam(required = false) Integer depth,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer limit
    ) {
        GraphResponse response = graphService.getCitationGraph(
                principal.getId(),
                collectionId,
                paperId,
                yearFrom,
                yearTo,
                author,
                importedOnly,
                depth,
                query,
                limit
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citations/{paperId}/neighborhood")
    @Operation(summary = "Get N-hop citation neighborhood around a specific root research paper")
    public ResponseEntity<GraphResponse> getCitationNeighborhood(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID paperId,
            @RequestParam(defaultValue = "1") Integer depth
    ) {
        GraphResponse response = graphService.getCitationNeighborhood(principal.getId(), paperId, depth);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/concepts")
    @Operation(summary = "Get multi-entity concept and claim evidence graph")
    public ResponseEntity<GraphResponse> getConceptGraph(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) UUID collectionId,
            @RequestParam(required = false) UUID paperId,
            @RequestParam(required = false) UUID claimId,
            @RequestParam(required = false) List<String> nodeTypes,
            @RequestParam(required = false) List<String> relationshipTypes,
            @RequestParam(required = false) List<String> provenanceTypes,
            @RequestParam(required = false) List<String> reviewStatus,
            @RequestParam(required = false) Boolean showEvidenceChunks,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer limit
    ) {
        GraphResponse response = graphService.getConceptGraph(
                principal.getId(),
                collectionId,
                paperId,
                claimId,
                nodeTypes,
                relationshipTypes,
                provenanceTypes,
                reviewStatus,
                showEvidenceChunks,
                query,
                limit
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/claims/{claimId}/neighborhood")
    @Operation(summary = "Get focused evidence neighborhood around a specific research claim")
    public ResponseEntity<GraphResponse> getClaimNeighborhood(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID claimId
    ) {
        GraphResponse response = graphService.getClaimNeighborhood(principal.getId(), claimId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/nodes/{nodeId}")
    @Operation(summary = "Inspect detailed provenance and evidence snippets for a specific graph node")
    public ResponseEntity<GraphNodeDetails> getNodeDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String nodeId
    ) {
        GraphNodeDetails details = graphService.getNodeDetails(principal.getId(), nodeId);
        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(details);
    }

    @GetMapping("/edges/{edgeId}")
    @Operation(summary = "Inspect detailed provenance and rationale for a specific graph relationship edge")
    public ResponseEntity<GraphEdgeDetails> getEdgeDetails(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable String edgeId
    ) {
        GraphEdgeDetails details = graphService.getEdgeDetails(principal.getId(), edgeId);
        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(details);
    }
}
