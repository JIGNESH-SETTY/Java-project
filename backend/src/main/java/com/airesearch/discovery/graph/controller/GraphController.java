package com.airesearch.discovery.graph.controller;

import com.airesearch.discovery.auth.security.UserPrincipal;
import com.airesearch.discovery.graph.dto.GraphDtos.GraphResponse;
import com.airesearch.discovery.graph.service.GraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/graphs")
@Tag(name = "Knowledge Graphs", description = "Cytoscape.js citation and concept graph visualizers")
public class GraphController {

    private final GraphService graphService;

    public GraphController(GraphService graphService) {
        this.graphService = graphService;
    }

    @GetMapping("/citations")
    @Operation(summary = "Get citation network graph with resolved and external reference nodes")
    public ResponseEntity<GraphResponse> getCitationGraph(@AuthenticationPrincipal UserPrincipal principal) {
        GraphResponse graph = graphService.getCitationGraph(principal.getId());
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/concepts")
    @Operation(summary = "Get multi-entity concept graph connecting papers, concepts, methods, and claims")
    public ResponseEntity<GraphResponse> getConceptGraph(@AuthenticationPrincipal UserPrincipal principal) {
        GraphResponse graph = graphService.getConceptGraph(principal.getId());
        return ResponseEntity.ok(graph);
    }
}
