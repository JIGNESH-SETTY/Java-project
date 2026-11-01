package com.airesearch.discovery.graph.repository;

import com.airesearch.discovery.graph.dto.GraphDtos.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class CitationGraphRepository {

    private final JdbcTemplate jdbcTemplate;

    public CitationGraphRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public GraphResponse findCitationGraph(
            UUID userId,
            UUID collectionId,
            UUID rootPaperId,
            Integer yearFrom,
            Integer yearTo,
            String author,
            Boolean importedOnly,
            Integer depth,
            String query,
            int limit
    ) {
        int maxLimit = Math.min(Math.max(limit, 10), 200);

        // 1. Build query for accessible papers
        StringBuilder sql = new StringBuilder("""
            SELECT DISTINCT p.id, p.title, p.abstract, p.doi, p.publication_year, p.venue, p.processing_status, p.owner_id
            FROM papers p
            """);

        List<Object> params = new ArrayList<>();

        if (collectionId != null) {
            sql.append(" JOIN collection_papers cp ON cp.paper_id = p.id AND cp.collection_id = ? ");
            params.add(collectionId);
        }

        sql.append(" WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC') ");
        params.add(userId);

        if (rootPaperId != null) {
            sql.append(" AND p.id = ? ");
            params.add(rootPaperId);
        }

        if (yearFrom != null) {
            sql.append(" AND p.publication_year >= ? ");
            params.add(yearFrom);
        }

        if (yearTo != null) {
            sql.append(" AND p.publication_year <= ? ");
            params.add(yearTo);
        }

        if (query != null && !query.isBlank()) {
            sql.append(" AND (LOWER(p.title) LIKE ? OR LOWER(COALESCE(p.doi, '')) LIKE ?) ");
            String likeQuery = "%" + query.trim().toLowerCase(Locale.ROOT) + "%";
            params.add(likeQuery);
            params.add(likeQuery);
        }

        if (author != null && !author.isBlank()) {
            sql.append("""
                AND EXISTS (
                    SELECT 1 FROM paper_authors pa
                    JOIN authors a ON pa.author_id = a.id
                    WHERE pa.paper_id = p.id AND (LOWER(a.display_name) LIKE ? OR LOWER(a.normalized_name) LIKE ?)
                )
                """);
            String likeAuth = "%" + author.trim().toLowerCase(Locale.ROOT) + "%";
            params.add(likeAuth);
            params.add(likeAuth);
        }

        sql.append(" ORDER BY p.publication_year DESC NULLS LAST LIMIT ?");
        params.add(maxLimit);

        List<GraphNode> nodes = new ArrayList<>();
        Map<UUID, String> paperNodeIds = new HashMap<>();
        Set<UUID> loadedPaperIds = new HashSet<>();

        jdbcTemplate.query(sql.toString(), (rs) -> {
            UUID id = UUID.fromString(rs.getString("id"));
            String title = rs.getString("title");
            String doi = rs.getString("doi");
            int year = rs.getInt("publication_year");
            String venue = rs.getString("venue");
            String abs = rs.getString("abstract");
            UUID ownerId = UUID.fromString(rs.getString("owner_id"));

            String nodeId = "paper:" + id;
            paperNodeIds.put(id, nodeId);
            loadedPaperIds.add(id);

            Map<String, Object> data = new HashMap<>();
            data.put("paperId", id.toString());
            data.put("title", title);
            data.put("doi", doi);
            data.put("year", rs.wasNull() ? null : year);
            data.put("venue", venue);
            data.put("abstract", abs);
            data.put("isImported", ownerId.equals(userId));
            data.put("provenance", "REPORTED_IN_PAPER");

            nodes.add(new GraphNode(nodeId, title, "PAPER", data));
        }, params.toArray());

        if (nodes.isEmpty()) {
            return new GraphResponse(Collections.emptyList(), Collections.emptyList(), new GraphMetadata(0, 0, false, Map.of()));
        }

        // 2. Fetch authors and citation counts for loaded papers
        enrichPaperAuthorsAndCitations(nodes, loadedPaperIds);

        // 3. Fetch bibliographic citation edges
        List<GraphEdge> edges = new ArrayList<>();
        Set<String> externalNodeIds = new HashSet<>();
        boolean allowExternal = !Boolean.TRUE.equals(importedOnly);

        String refSql = """
            SELECT pr.id, pr.source_paper_id, pr.cited_paper_id, pr.cited_title, pr.cited_doi, pr.raw_reference_text, pr.resolution_status
            FROM paper_references pr
            WHERE pr.source_paper_id IN (""" + String.join(",", Collections.nCopies(loadedPaperIds.size(), "?")) + ")";

        List<Object> refParams = new ArrayList<>(loadedPaperIds);

        jdbcTemplate.query(refSql, (rs) -> {
            String refId = rs.getString("id");
            UUID sourcePaperId = UUID.fromString(rs.getString("source_paper_id"));
            String citedPaperIdStr = rs.getString("cited_paper_id");
            String citedTitle = rs.getString("cited_title");
            String rawRef = rs.getString("raw_reference_text");

            String sourceNodeId = paperNodeIds.get(sourcePaperId);
            if (sourceNodeId == null) return;

            if (citedPaperIdStr != null) {
                UUID citedPaperId = UUID.fromString(citedPaperIdStr);
                String targetNodeId = paperNodeIds.get(citedPaperId);

                // Internal citation between loaded papers
                if (targetNodeId != null) {
                    Map<String, Object> edgeData = new HashMap<>();
                    edgeData.put("provenance", "REPORTED_IN_PAPER");
                    edgeData.put("rawReferenceText", rawRef);
                    edgeData.put("label", "cites");

                    edges.add(new GraphEdge(
                            "citation:" + refId,
                            sourceNodeId,
                            targetNodeId,
                            "CITES",
                            edgeData
                    ));
                }
            } else if (allowExternal && citedTitle != null && !citedTitle.isBlank() && nodes.size() < (maxLimit + 40)) {
                // External reference
                String extNodeId = "paper:ext-" + Math.abs(citedTitle.toLowerCase(Locale.ROOT).hashCode());
                if (!externalNodeIds.contains(extNodeId)) {
                    externalNodeIds.add(extNodeId);
                    Map<String, Object> extData = new HashMap<>();
                    extData.put("title", citedTitle);
                    extData.put("isImported", false);
                    extData.put("isUnresolved", true);
                    extData.put("provenance", "REPORTED_IN_PAPER");
                    nodes.add(new GraphNode(extNodeId, citedTitle, "UNRESOLVED_PAPER", extData));
                }

                Map<String, Object> edgeData = new HashMap<>();
                edgeData.put("provenance", "REPORTED_IN_PAPER");
                edgeData.put("rawReferenceText", rawRef);
                edgeData.put("label", "cites (external)");

                edges.add(new GraphEdge(
                        "citation:ext-" + refId,
                        sourceNodeId,
                        extNodeId,
                        "CITES",
                        edgeData
                ));
            }
        }, refParams.toArray());

        Map<String, Object> appliedFilters = new HashMap<>();
        if (collectionId != null) appliedFilters.put("collectionId", collectionId.toString());
        if (yearFrom != null) appliedFilters.put("yearFrom", yearFrom);
        if (yearTo != null) appliedFilters.put("yearTo", yearTo);
        if (query != null) appliedFilters.put("query", query);

        return new GraphResponse(
                nodes,
                edges,
                new GraphMetadata(nodes.size(), edges.size(), nodes.size() >= maxLimit, appliedFilters)
        );
    }

    public GraphResponse findNeighborhood(UUID userId, UUID paperId, int depth) {
        int searchDepth = Math.max(1, Math.min(depth, 3));

        // Find papers directly citing or cited by paperId
        String neighborSql = """
            WITH RECURSIVE citation_hops AS (
                -- Base: direct citations in both directions
                SELECT source_paper_id, cited_paper_id, 1 as hop
                FROM paper_references
                WHERE (source_paper_id = ? OR cited_paper_id = ?)
                  AND cited_paper_id IS NOT NULL

                UNION

                -- Recursive: step hops
                SELECT pr.source_paper_id, pr.cited_paper_id, ch.hop + 1
                FROM paper_references pr
                JOIN citation_hops ch ON (pr.source_paper_id = ch.cited_paper_id OR pr.cited_paper_id = ch.source_paper_id)
                WHERE ch.hop < ? AND pr.cited_paper_id IS NOT NULL
            )
            SELECT DISTINCT p.id
            FROM citation_hops ch
            JOIN papers p ON (p.id = ch.source_paper_id OR p.id = ch.cited_paper_id)
            WHERE (p.owner_id = ? OR p.visibility = 'PUBLIC')
            LIMIT 80
            """;

        List<UUID> neighborIds = jdbcTemplate.query(
                neighborSql,
                (rs, rowNum) -> UUID.fromString(rs.getString("id")),
                paperId, paperId, searchDepth, userId
        );

        if (!neighborIds.contains(paperId)) {
            neighborIds.add(paperId);
        }

        return findCitationGraph(userId, null, null, null, null, null, false, searchDepth, null, 100);
    }

    private void enrichPaperAuthorsAndCitations(List<GraphNode> nodes, Set<UUID> paperIds) {
        if (paperIds.isEmpty()) return;

        Map<String, GraphNode> nodeMap = new HashMap<>();
        for (GraphNode n : nodes) {
            nodeMap.put(n.id(), n);
        }

        // Fetch authors
        String authSql = """
            SELECT pa.paper_id, a.display_name
            FROM paper_authors pa
            JOIN authors a ON pa.author_id = a.id
            WHERE pa.paper_id IN (""" + String.join(",", Collections.nCopies(paperIds.size(), "?")) + ") ORDER BY pa.paper_id, pa.author_order";

        Map<UUID, List<String>> authorMap = new HashMap<>();
        jdbcTemplate.query(authSql, (rs) -> {
            UUID pId = UUID.fromString(rs.getString("paper_id"));
            String name = rs.getString("display_name");
            authorMap.computeIfAbsent(pId, (k) -> new ArrayList<>()).add(name);
        }, paperIds.toArray());

        for (Map.Entry<UUID, List<String>> entry : authorMap.entrySet()) {
            GraphNode node = nodeMap.get("paper:" + entry.getKey());
            if (node != null) {
                node.data().put("authors", entry.getValue());
            }
        }

        // Fetch citation counts (incoming citations)
        String citeCountSql = """
            SELECT cited_paper_id, COUNT(*) as count
            FROM paper_references
            WHERE cited_paper_id IN (""" + String.join(",", Collections.nCopies(paperIds.size(), "?")) + ") GROUP BY cited_paper_id";

        jdbcTemplate.query(citeCountSql, (rs) -> {
            UUID pId = UUID.fromString(rs.getString("cited_paper_id"));
            int count = rs.getInt("count");
            GraphNode node = nodeMap.get("paper:" + pId);
            if (node != null) {
                node.data().put("citationCount", count);
            }
        }, paperIds.toArray());
    }
}

