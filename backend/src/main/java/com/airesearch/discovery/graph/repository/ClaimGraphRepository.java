package com.airesearch.discovery.graph.repository;

import com.airesearch.discovery.graph.dto.GraphDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ClaimGraphRepository {

    private final JdbcTemplate jdbcTemplate;

    public ClaimGraphRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public GraphResponse findClaimNeighborhood(UUID userId, UUID claimId) {
        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();
        Set<String> nodeIds = new HashSet<>();

        // 1. Fetch target claim and ensure paper is accessible
        String claimSql = """
            SELECT c.id, c.paper_id, c.source_chunk_id, c.normalized_text, c.source_text,
                   c.claim_type, c.provenance_type, c.extraction_confidence, c.section_name, c.page_number,
                   p.title as paper_title, p.publication_year, p.owner_id
            FROM claims c
            JOIN papers p ON c.paper_id = p.id
            WHERE c.id = ? AND (p.owner_id = ? OR p.visibility = 'PUBLIC')
            """;

        UUID[] parentPaperId = new UUID[1];
        UUID[] sourceChunkId = new UUID[1];

        jdbcTemplate.query(claimSql, (rs) -> {
            String clId = "claim:" + rs.getString("id");
            nodeIds.add(clId);
            parentPaperId[0] = UUID.fromString(rs.getString("paper_id"));
            String chunkStr = rs.getString("source_chunk_id");
            if (chunkStr != null) sourceChunkId[0] = UUID.fromString(chunkStr);

            Map<String, Object> data = new HashMap<>();
            data.put("claimId", rs.getString("id"));
            data.put("paperId", rs.getString("paper_id"));
            data.put("normalizedText", rs.getString("normalized_text"));
            data.put("sourceText", rs.getString("source_text"));
            data.put("claimType", rs.getString("claim_type"));
            data.put("provenance", rs.getString("provenance_type"));
            data.put("confidence", rs.getDouble("extraction_confidence"));
            data.put("sectionName", rs.getString("section_name"));
            data.put("pageNumber", rs.getInt("page_number"));

            nodes.add(new GraphNode(clId, rs.getString("normalized_text"), "CLAIM", data));

            // Add Parent Paper Node
            String pNodeId = "paper:" + parentPaperId[0];
            if (!nodeIds.contains(pNodeId)) {
                nodeIds.add(pNodeId);
                Map<String, Object> pData = new HashMap<>();
                pData.put("title", rs.getString("paper_title"));
                pData.put("year", rs.getInt("publication_year"));
                nodes.add(new GraphNode(pNodeId, rs.getString("paper_title"), "PAPER", pData));

                edges.add(new GraphEdge(
                        "edge:reports-" + rs.getString("id"),
                        pNodeId,
                        clId,
                        "REPORTS",
                        Map.of("label", "reports claim", "provenance", "REPORTED_IN_PAPER")
                ));
            }
        }, claimId, userId);

        if (nodes.isEmpty()) {
            return new GraphResponse(Collections.emptyList(), Collections.emptyList(), new GraphMetadata(0, 0, false, Map.of()));
        }

        // 2. Fetch Evidence Chunk if present
        if (sourceChunkId[0] != null) {
            String chunkSql = "SELECT id, section_name, page_number, content FROM document_chunks WHERE id = ?";
            jdbcTemplate.query(chunkSql, (rs) -> {
                String chNodeId = "chunk:" + rs.getString("id");
                if (!nodeIds.contains(chNodeId)) {
                    nodeIds.add(chNodeId);
                    Map<String, Object> chData = new HashMap<>();
                    chData.put("chunkId", rs.getString("id"));
                    chData.put("sectionName", rs.getString("section_name"));
                    chData.put("pageNumber", rs.getInt("page_number"));
                    chData.put("content", rs.getString("content"));

                    nodes.add(new GraphNode(chNodeId, "Evidence: " + rs.getString("section_name"), "CHUNK", chData));

                    edges.add(new GraphEdge(
                            "edge:has_evidence-" + claimId,
                            "claim:" + claimId,
                            chNodeId,
                            "HAS_EVIDENCE",
                            Map.of("label", "grounded in chunk", "provenance", "REPORTED_IN_PAPER")
                    ));
                }
            }, sourceChunkId[0]);
        }

        // 3. Fetch Claim Relations (both incoming and outgoing)
        String relSql = """
            SELECT cr.id, cr.source_claim_id, cr.target_claim_id, cr.relation_type,
                   cr.confidence, cr.rationale, cr.provenance_type, cr.review_status,
                   sc.normalized_text as source_text, tc.normalized_text as target_text
            FROM claim_relations cr
            JOIN claims sc ON cr.source_claim_id = sc.id
            JOIN claims tc ON cr.target_claim_id = tc.id
            WHERE cr.source_claim_id = ? OR cr.target_claim_id = ?
            """;

        jdbcTemplate.query(relSql, (rs) -> {
            String relId = rs.getString("id");
            String sId = "claim:" + rs.getString("source_claim_id");
            String tId = "claim:" + rs.getString("target_claim_id");
            String relType = rs.getString("relation_type");

            // Add missing partner claim node
            if (!nodeIds.contains(sId)) {
                nodeIds.add(sId);
                nodes.add(new GraphNode(sId, rs.getString("source_text"), "CLAIM", Map.of("normalizedText", rs.getString("source_text"))));
            }
            if (!nodeIds.contains(tId)) {
                nodeIds.add(tId);
                nodes.add(new GraphNode(tId, rs.getString("target_text"), "CLAIM", Map.of("normalizedText", rs.getString("target_text"))));
            }

            Map<String, Object> eData = new HashMap<>();
            eData.put("provenance", rs.getString("provenance_type"));
            eData.put("reviewStatus", rs.getString("review_status"));
            eData.put("confidence", rs.getDouble("confidence"));
            eData.put("rationale", rs.getString("rationale"));
            eData.put("isAiProposed", "AI_INTERPRETATION".equalsIgnoreCase(rs.getString("provenance_type")));
            eData.put("label", relType.toLowerCase(Locale.ROOT));

            edges.add(new GraphEdge(
                    "rel:" + relId,
                    sId,
                    tId,
                    relType.toUpperCase(Locale.ROOT),
                    eData
            ));
        }, claimId, claimId);

        return new GraphResponse(
                nodes,
                edges,
                new GraphMetadata(nodes.size(), edges.size(), false, Map.of("claimId", claimId.toString()))
        );
    }
}

