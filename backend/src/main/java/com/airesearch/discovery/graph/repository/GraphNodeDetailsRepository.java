package com.airesearch.discovery.graph.repository;

import com.airesearch.discovery.graph.dto.GraphDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class GraphNodeDetailsRepository {

    private final JdbcTemplate jdbcTemplate;

    public GraphNodeDetailsRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public GraphNodeDetails findNodeDetails(UUID userId, String rawNodeId) {
        if (rawNodeId == null || !rawNodeId.contains(":")) {
            return null;
        }

        String[] parts = rawNodeId.split(":", 2);
        String prefix = parts[0].toLowerCase(Locale.ROOT);
        String idStr = parts[1];

        // 1. PAPER details
        if ("paper".equals(prefix)) {
            UUID paperId;
            try {
                paperId = UUID.fromString(idStr);
            } catch (IllegalArgumentException e) {
                return null;
            }

            String sql = """
                SELECT p.id, p.title, p.abstract, p.doi, p.publication_year, p.venue, p.processing_status, p.owner_id
                FROM papers p
                WHERE p.id = ? AND (p.owner_id = ? OR p.visibility = 'PUBLIC')
                """;

            List<GraphNode> nodes = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> data = new HashMap<>();
                data.put("paperId", rs.getString("id"));
                data.put("title", rs.getString("title"));
                data.put("abstract", rs.getString("abstract"));
                data.put("doi", rs.getString("doi"));
                data.put("year", rs.getInt("publication_year"));
                data.put("venue", rs.getString("venue"));
                data.put("isImported", UUID.fromString(rs.getString("owner_id")).equals(userId));

                return new GraphNode(rawNodeId, rs.getString("title"), "PAPER", data);
            }, paperId, userId);

            if (nodes.isEmpty()) return null;
            GraphNode node = nodes.get(0);

            // Fetch authors
            List<String> authors = jdbcTemplate.query(
                    "SELECT a.display_name FROM paper_authors pa JOIN authors a ON pa.author_id = a.id WHERE pa.paper_id = ? ORDER BY pa.author_order",
                    (rs, rowNum) -> rs.getString("display_name"),
                    paperId
            );
            node.data().put("authors", authors);

            // Count incoming/outgoing citations
            Integer incoming = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM paper_references WHERE cited_paper_id = ?",
                    Integer.class,
                    paperId
            );
            Integer outgoing = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM paper_references WHERE source_paper_id = ?",
                    Integer.class,
                    paperId
            );
            node.data().put("incomingCitations", incoming != null ? incoming : 0);
            node.data().put("outgoingCitations", outgoing != null ? outgoing : 0);

            return new GraphNodeDetails(node, Collections.emptyList(), Collections.emptyList(), "REPORTED_IN_PAPER", Collections.emptyList());
        }

        // 2. CLAIM details
        if ("claim".equals(prefix)) {
            UUID claimId;
            try {
                claimId = UUID.fromString(idStr);
            } catch (IllegalArgumentException e) {
                return null;
            }

            String sql = """
                SELECT c.id, c.paper_id, c.source_chunk_id, c.normalized_text, c.source_text,
                       c.claim_type, c.provenance_type, c.extraction_confidence, c.section_name, c.page_number,
                       p.title as paper_title
                FROM claims c
                JOIN papers p ON c.paper_id = p.id
                WHERE c.id = ? AND (p.owner_id = ? OR p.visibility = 'PUBLIC')
                """;

            List<GraphNode> nodes = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> data = new HashMap<>();
                data.put("claimId", rs.getString("id"));
                data.put("paperId", rs.getString("paper_id"));
                data.put("paperTitle", rs.getString("paper_title"));
                data.put("normalizedText", rs.getString("normalized_text"));
                data.put("sourceText", rs.getString("source_text"));
                data.put("claimType", rs.getString("claim_type"));
                data.put("provenance", rs.getString("provenance_type"));
                data.put("confidence", rs.getDouble("extraction_confidence"));
                data.put("sectionName", rs.getString("section_name"));
                data.put("pageNumber", rs.getInt("page_number"));

                return new GraphNode(rawNodeId, rs.getString("normalized_text"), "CLAIM", data);
            }, claimId, userId);

            if (nodes.isEmpty()) return null;
            GraphNode node = nodes.get(0);

            // Fetch attached evidence chunk if available
            List<Map<String, Object>> evidenceSnippets = new ArrayList<>();
            Object chunkIdObj = node.data().get("source_chunk_id");
            if (chunkIdObj != null) {
                String chunkSql = "SELECT id, section_name, page_number, content FROM document_chunks WHERE id = ?";
                jdbcTemplate.query(chunkSql, (rs) -> {
                    Map<String, Object> snip = new HashMap<>();
                    snip.put("chunkId", rs.getString("id"));
                    snip.put("sectionName", rs.getString("section_name"));
                    snip.put("pageNumber", rs.getInt("page_number"));
                    snip.put("text", rs.getString("content"));
                    evidenceSnippets.add(snip);
                }, UUID.fromString(chunkIdObj.toString()));
            }

            return new GraphNodeDetails(
                    node,
                    Collections.emptyList(),
                    Collections.emptyList(),
                    (String) node.data().get("provenance"),
                    evidenceSnippets
            );
        }

        // 3. CONCEPT / METHOD / DATASET details
        if ("concept".equals(prefix)) {
            UUID conceptId;
            try {
                conceptId = UUID.fromString(idStr);
            } catch (IllegalArgumentException e) {
                return null;
            }

            String sql = "SELECT id, normalized_name, display_name, concept_type FROM concepts WHERE id = ?";
            List<GraphNode> nodes = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Map<String, Object> data = new HashMap<>();
                data.put("conceptId", rs.getString("id"));
                data.put("conceptName", rs.getString("display_name"));
                data.put("conceptType", rs.getString("concept_type"));
                return new GraphNode(rawNodeId, rs.getString("display_name"), "CONCEPT", data);
            }, conceptId);

            if (nodes.isEmpty()) return null;
            return new GraphNodeDetails(nodes.get(0), Collections.emptyList(), Collections.emptyList(), "REPORTED_IN_PAPER", Collections.emptyList());
        }

        return null;
    }

    public GraphEdgeDetails findEdgeDetails(UUID userId, String rawEdgeId) {
        if (rawEdgeId == null || !rawEdgeId.contains(":")) {
            return null;
        }

        String[] parts = rawEdgeId.split(":", 2);
        String prefix = parts[0].toLowerCase(Locale.ROOT);
        String idStr = parts[1];

        if ("rel".equals(prefix)) {
            UUID relId;
            try {
                relId = UUID.fromString(idStr);
            } catch (IllegalArgumentException e) {
                return null;
            }

            String sql = """
                SELECT cr.id, cr.source_claim_id, cr.target_claim_id, cr.relation_type,
                       cr.confidence, cr.rationale, cr.provenance_type, cr.review_status,
                       sc.normalized_text as source_text, tc.normalized_text as target_text
                FROM claim_relations cr
                JOIN claims sc ON cr.source_claim_id = sc.id
                JOIN claims tc ON cr.target_claim_id = tc.id
                WHERE cr.id = ?
                """;

            List<GraphEdgeDetails> details = jdbcTemplate.query(sql, (rs, rowNum) -> {
                String sId = "claim:" + rs.getString("source_claim_id");
                String tId = "claim:" + rs.getString("target_claim_id");

                Map<String, Object> data = new HashMap<>();
                data.put("provenance", rs.getString("provenance_type"));
                data.put("reviewStatus", rs.getString("review_status"));
                data.put("confidence", rs.getDouble("confidence"));
                data.put("rationale", rs.getString("rationale"));
                data.put("isAiProposed", "AI_INTERPRETATION".equalsIgnoreCase(rs.getString("provenance_type")));

                GraphEdge edge = new GraphEdge(rawEdgeId, sId, tId, rs.getString("relation_type"), data);
                GraphNode source = new GraphNode(sId, rs.getString("source_text"), "CLAIM", Map.of("normalizedText", rs.getString("source_text")));
                GraphNode target = new GraphNode(tId, rs.getString("target_text"), "CLAIM", Map.of("normalizedText", rs.getString("target_text")));

                return new GraphEdgeDetails(edge, source, target, Collections.emptyList());
            }, relId);

            if (details.isEmpty()) return null;
            GraphEdgeDetails edgeDetails = details.get(0);

            // Fetch attached evidence snippets from claim_relation_evidence
            String evSql = """
                SELECT cre.evidence_role, dc.id as chunk_id, dc.content
                FROM claim_relation_evidence cre
                JOIN document_chunks dc ON cre.evidence_chunk_id = dc.id
                WHERE cre.claim_relation_id = ?
                """;

            List<Map<String, Object>> evList = jdbcTemplate.query(evSql, (rs, rowNum) -> {
                Map<String, Object> ev = new HashMap<>();
                ev.put("chunkId", rs.getString("chunk_id"));
                ev.put("role", rs.getString("evidence_role"));
                ev.put("snippet", rs.getString("content"));
                return ev;
            }, relId);

            return new GraphEdgeDetails(edgeDetails.edge(), edgeDetails.sourceNode(), edgeDetails.targetNode(), evList);
        }

        return null;
    }
}

