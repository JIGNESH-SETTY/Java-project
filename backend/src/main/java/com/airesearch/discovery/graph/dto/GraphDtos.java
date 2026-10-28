package com.airesearch.discovery.graph.dto;

import com.airesearch.discovery.shared.enums.ProvenanceType;

import java.util.List;
import java.util.Map;

public class GraphDtos {

    public record GraphNode(
            String id,
            String label,
            String type, // PAPER, CONCEPT, METHOD, DATASET, CLAIM
            Map<String, Object> data
    ) {}

    public record GraphEdge(
            String id,
            String source,
            String target,
            String label,
            String relationType,
            ProvenanceType provenance,
            Double confidence,
            String rationale,
            boolean isAiProposed
    ) {}

    public record GraphResponse(
            List<GraphNode> nodes,
            List<GraphEdge> edges,
            int totalNodes,
            int totalEdges
    ) {}
}
