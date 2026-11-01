package com.airesearch.discovery.graph.repository;

import com.airesearch.discovery.graph.dto.GraphDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class ConceptGraphRepository {

    private final JdbcTemplate jdbcTemplate;

    public ConceptGraphRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public GraphResponse findConceptGraph(
            UUID userId,
            UUID collectionId,
            UUID paperId,
            UUID claimId,
            List<String> nodeTypes,
            List<String> relationshipTypes,
            List<String> provenanceTypes,
            List<String> reviewStatus,
            boolean showEvidenceChunks,
            String query,
            int limit
    ) {
        int maxLimit = Math.min(Math.max(limit, 10), 250);

        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();
        Set<String> nodeIds = new HashSet<>();
        Map<UUID, String> paperNodeMap = new HashMap<>();
        Map<UUID, String> claimNodeMap = new HashMap<>();
        Map<UUID, String> conceptNodeMap = new HashMap<>();

        // 1. Fetch Accessible Papers
        StringBuilder paperSql = new StringBuilder("""
            SELECT DISTINCT p.id, p.title, p.publication_year, p.owner_id
            FROM papers p
            """);
        List<Object> paperParams = new ArrayList<>();

        if (collectionId != null) {
            paperSql.append(" JOIN collection_papers cp ON cp.paper_id = p.id AND cp.collection_id = ? ");
            paperParams.add(collectionId);
        }

        paperSql.append(" WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC') ");
        paperParams.add(userId);

        if (paperId != null) {
            paperSql.append(" AND p.id = ? ");
            paperParams.add(paperId);
        }

        if (query != null && !query.isBlank()) {
            paperSql.append(" AND LOWER(p.title) LIKE ? ");
            paperParams.add("%" + query.trim().toLowerCase(Locale.ROOT) + "%");
        }

        paperSql.append(" ORDER BY p.publication_year DESC NULLS LAST LIMIT ?");
        paperParams.add(maxLimit);

        Set<UUID> loadedPaperIds = new HashSet<>();
        jdbcTemplate.query(paperSql.toString(), (rs) -> {
            UUID pId = UUID.fromString(rs.getString("id"));
            String title = rs.getString("title");
            int year = rs.getInt("publication_year");
            UUID ownerId = UUID.fromString(rs.getString("owner_id"));

            String nId = "paper:" + pId;
            nodeIds.add(nId);
            paperNodeMap.put(pId, nId);
            loadedPaperIds.add(pId);

            Map<String, Object> data = new HashMap<>();
            data.put("paperId", pId.toString());
            data.put("title", title);
            data.put("year", rs.wasNull() ? null : year);
            data.put("isImported", ownerId.equals(userId));
            data.put("provenance", "REPORTED_IN_PAPER");

            nodes.add(new GraphNode(nId, title, "PAPER", data));
        }, paperParams.toArray());

        if (loadedPaperIds.isEmpty()) {
            return new GraphResponse(Collections.emptyList(), Collections.emptyList(), new GraphMetadata(0, 0, false, Map.of()));
        }

        // 2. Fetch Concepts (Topics, Methods, Datasets) connected to loaded papers
        String paperInClause = String.join(",", Collections.nCopies(loadedPaperIds.size(), "?"));
        String conceptSql = """
            SELECT pc.paper_id, pc.concept_id, pc.relation_type, pc.confidence, pc.provenance_type,
                   c.normalized_name, c.display_name, c.concept_type
            FROM paper_concepts pc
            JOIN concepts c ON pc.concept_id = c.id
            WHERE pc.paper_id IN (""" + paperInClause + ")";

        jdbcTemplate.query(conceptSql, (rs) -> {
            UUID pId = UUID.fromString(rs.getString("paper_id"));
            UUID cId = UUID.fromString(rs.getString("concept_id"));
            String rawType = rs.getString("concept_type");
            String dispName = rs.getString("display_name");
            String relType = rs.getString("relation_type");
            double confidence = rs.getDouble("confidence");
            String prov = rs.getString("provenance_type");

            String nodeType = "CONCEPT";
            if ("METHOD".equalsIgnoreCase(rawType)) nodeType = "METHOD";
            else if ("DATASET".equalsIgnoreCase(rawType)) nodeType = "DATASET";

            String cNodeId = "concept:" + cId;
            if (!nodeIds.contains(cNodeId) && nodes.size() < (maxLimit + 60)) {
                nodeIds.add(cNodeId);
                conceptNodeMap.put(cId, cNodeId);

                Map<String, Object> cData = new HashMap<>();
                cData.put("conceptId", cId.toString());
                cData.put("conceptName", dispName);
                cData.put("conceptType", rawType);
                cData.put("provenance", prov);

                nodes.add(new GraphNode(cNodeId, dispName, nodeType, cData));
            }

            // Edge between paper and concept/method/dataset
            String pNodeId = paperNodeMap.get(pId);
            if (pNodeId != null && nodeIds.contains(cNodeId)) {
                String edgeType = "DISCUSSES";
                if ("METHOD".equalsIgnoreCase(rawType) || "USES".equalsIgnoreCase(relType)) edgeType = "USES_METHOD";
                else if ("DATASET".equalsIgnoreCase(rawType) || "EVALUATES_ON".equalsIgnoreCase(relType)) edgeType = "EVALUATED_ON";

                Map<String, Object> eData = new HashMap<>();
                eData.put("provenance", prov);
                eData.put("confidence", confidence);
                eData.put("label", relType.toLowerCase(Locale.ROOT));

                edges.add(new GraphEdge(
                        "edge:pc-" + pId + "-" + cId,
                        pNodeId,
                        cNodeId,
                        edgeType,
                        eData
                ));
            }
        }, loadedPaperIds.toArray());

        // 3. Fetch Claims for loaded papers
        StringBuilder claimSql = new StringBuilder("""
            SELECT c.id, c.paper_id, c.source_chunk_id, c.normalized_text, c.source_text,
                   c.claim_type, c.provenance_type, c.extraction_confidence, c.section_name, c.page_number
            FROM claims c
            WHERE c.paper_id IN (""" + paperInClause + ")");

        List<Object> claimParams = new ArrayList<>(loadedPaperIds);

        if (claimId != null) {
            claimSql.append(" AND c.id = ? ");
            claimParams.add(claimId);
        }

        Set<UUID> loadedClaimIds = new HashSet<>();
        jdbcTemplate.query(claimSql.toString(), (rs) -> {
            UUID clId = UUID.fromString(rs.getString("id"));
            UUID pId = UUID.fromString(rs.getString("paper_id"));
            String normText = rs.getString("normalized_text");
            String srcText = rs.getString("source_text");
            String clType = rs.getString("claim_type");
            String prov = rs.getString("provenance_type");
            double conf = rs.getDouble("extraction_confidence");
            String sec = rs.getString("section_name");
            int pg = rs.getInt("page_number");

            String clNodeId = "claim:" + clId;
            if (!nodeIds.contains(clNodeId) && nodes.size() < (maxLimit + 80)) {
                nodeIds.add(clNodeId);
                claimNodeMap.put(clId, clNodeId);
                loadedClaimIds.add(clId);

                Map<String, Object> data = new HashMap<>();
                data.put("claimId", clId.toString());
                data.put("paperId", pId.toString());
                data.put("normalizedText", normText);
                data.put("sourceText", srcText);
                data.put("claimType", clType);
                data.put("provenance", prov);
                data.put("confidence", conf);
                data.put("sectionName", sec);
                data.put("pageNumber", rs.wasNull() ? null : pg);

                nodes.add(new GraphNode(clNodeId, normText, "CLAIM", data));

                // Connect Paper to Claim (REPORTS)
                String pNodeId = paperNodeMap.get(pId);
                if (pNodeId != null) {
                    Map<String, Object> eData = new HashMap<>();
                    eData.put("provenance", prov);
                    eData.put("label", "reports claim");

                    edges.add(new GraphEdge(
                            "edge:report-" + clId,
                            pNodeId,
                            clNodeId,
                            "REPORTS",
                            eData
                    ));
                }
            }
        }, claimParams.toArray());

        // 4. Fetch Cross-Claim Relationships (SUPPORTS, CONTRADICTS, QUALIFIES, EXTENDS)
        if (!loadedClaimIds.isEmpty()) {
            String claimInClause = String.join(",", Collections.nCopies(loadedClaimIds.size(), "?"));
            String relSql = """
                SELECT cr.id, cr.source_claim_id, cr.target_claim_id, cr.relation_type,
                       cr.confidence, cr.rationale, cr.provenance_type, cr.review_status
                FROM claim_relations cr
                WHERE (cr.source_claim_id IN (""" + claimInClause + ") OR cr.target_claim_id IN (" + claimInClause + "))";

            List<Object> relParams = new ArrayList<>();
            relParams.addAll(loadedClaimIds);
            relParams.addAll(loadedClaimIds);

            jdbcTemplate.query(relSql, (rs) -> {
                String relId = rs.getString("id");
                UUID sId = UUID.fromString(rs.getString("source_claim_id"));
                UUID tId = UUID.fromString(rs.getString("target_claim_id"));
                String relType = rs.getString("relation_type");
                double conf = rs.getDouble("confidence");
                String rationale = rs.getString("rationale");
                String prov = rs.getString("provenance_type");
                String revStatus = rs.getString("review_status");

                // Do not return rejected AI-proposed relationships by default
                if ("REJECTED".equalsIgnoreCase(revStatus) && (reviewStatus == null || !reviewStatus.contains("REJECTED"))) {
                    return;
                }

                String sNodeId = claimNodeMap.get(sId);
                String tNodeId = claimNodeMap.get(tId);

                if (sNodeId != null && tNodeId != null) {
                    Map<String, Object> edgeData = new HashMap<>();
                    edgeData.put("relationId", relId);
                    edgeData.put("provenance", prov);
                    edgeData.put("reviewStatus", revStatus);
                    edgeData.put("confidence", conf);
                    edgeData.put("rationale", rationale);
                    edgeData.put("isAiProposed", "AI_INTERPRETATION".equalsIgnoreCase(prov));
                    edgeData.put("label", relType.toLowerCase(Locale.ROOT));

                    edges.add(new GraphEdge(
                            "rel:" + relId,
                            sNodeId,
                            tNodeId,
                            relType.toUpperCase(Locale.ROOT),
                            edgeData
                    ));
                }
            }, relParams.toArray());
        }

        // Apply metadata filters summary
        Map<String, Object> applied = new HashMap<>();
        if (collectionId != null) applied.put("collectionId", collectionId.toString());
        if (paperId != null) applied.put("paperId", paperId.toString());
        if (query != null) applied.put("query", query);

        return new GraphResponse(
                nodes,
                edges,
                new GraphMetadata(nodes.size(), edges.size(), nodes.size() >= maxLimit, applied)
        );
    }
}

