package com.airesearch.discovery.graph.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;
import java.util.Map;

public class GraphDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GraphNode(
            String id,
            String label,
            String type, // PAPER, CONCEPT, METHOD, DATASET, CLAIM, CHUNK, AI_INTERPRETATION, UNRESOLVED_PAPER
            Map<String, Object> data
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GraphEdge(
            String id,
            String source,
            String target,
            String type, // CITES, REPORTS, HAS_EVIDENCE, USES_METHOD, EVALUATED_ON, SUPPORTS, CONTRADICTS, QUALIFIES, EXTENDS, DISCUSSES, AI_PROPOSED
            Map<String, Object> data
    ) {}

    public record GraphMetadata(
            int totalNodes,
            int totalEdges,
            boolean isTruncated,
            Map<String, Object> appliedFilters
    ) {}

    public record GraphResponse(
            List<GraphNode> nodes,
            List<GraphEdge> edges,
            GraphMetadata metadata
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GraphNodeDetails(
            GraphNode node,
            List<GraphEdge> connectedEdges,
            List<GraphNode> neighborNodes,
            String provenance,
            List<Map<String, Object>> evidenceSnippets
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GraphEdgeDetails(
            GraphEdge edge,
            GraphNode sourceNode,
            GraphNode targetNode,
            List<Map<String, Object>> evidenceList
    ) {}
}
