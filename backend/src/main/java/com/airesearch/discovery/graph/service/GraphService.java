package com.airesearch.discovery.graph.service;

import com.airesearch.discovery.graph.dto.GraphDtos.*;
import com.airesearch.discovery.graph.repository.CitationGraphRepository;
import com.airesearch.discovery.graph.repository.ClaimGraphRepository;
import com.airesearch.discovery.graph.repository.ConceptGraphRepository;
import com.airesearch.discovery.graph.repository.GraphNodeDetailsRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class GraphService {

    private final CitationGraphRepository citationGraphRepository;
    private final ConceptGraphRepository conceptGraphRepository;
    private final ClaimGraphRepository claimGraphRepository;
    private final GraphNodeDetailsRepository nodeDetailsRepository;

    public GraphService(
            CitationGraphRepository citationGraphRepository,
            ConceptGraphRepository conceptGraphRepository,
            ClaimGraphRepository claimGraphRepository,
            GraphNodeDetailsRepository nodeDetailsRepository
    ) {
        this.citationGraphRepository = citationGraphRepository;
        this.conceptGraphRepository = conceptGraphRepository;
        this.claimGraphRepository = claimGraphRepository;
        this.nodeDetailsRepository = nodeDetailsRepository;
    }

    public GraphResponse getCitationGraph(
            UUID userId,
            UUID collectionId,
            UUID paperId,
            Integer yearFrom,
            Integer yearTo,
            String author,
            Boolean importedOnly,
            Integer depth,
            String query,
            Integer limit
    ) {
        int queryLimit = (limit != null && limit > 0) ? limit : 100;
        return citationGraphRepository.findCitationGraph(
                userId,
                collectionId,
                paperId,
                yearFrom,
                yearTo,
                author,
                importedOnly,
                depth,
                query,
                queryLimit
        );
    }

    public GraphResponse getCitationNeighborhood(UUID userId, UUID paperId, Integer depth) {
        int searchDepth = (depth != null && depth > 0) ? depth : 1;
        return citationGraphRepository.findNeighborhood(userId, paperId, searchDepth);
    }

    public GraphResponse getConceptGraph(
            UUID userId,
            UUID collectionId,
            UUID paperId,
            UUID claimId,
            List<String> nodeTypes,
            List<String> relationshipTypes,
            List<String> provenanceTypes,
            List<String> reviewStatus,
            Boolean showEvidenceChunks,
            String query,
            Integer limit
    ) {
        int queryLimit = (limit != null && limit > 0) ? limit : 100;
        boolean chunks = Boolean.TRUE.equals(showEvidenceChunks);
        return conceptGraphRepository.findConceptGraph(
                userId,
                collectionId,
                paperId,
                claimId,
                nodeTypes,
                relationshipTypes,
                provenanceTypes,
                reviewStatus,
                chunks,
                query,
                queryLimit
        );
    }

    public GraphResponse getClaimNeighborhood(UUID userId, UUID claimId) {
        return claimGraphRepository.findClaimNeighborhood(userId, claimId);
    }

    public GraphNodeDetails getNodeDetails(UUID userId, String nodeId) {
        return nodeDetailsRepository.findNodeDetails(userId, nodeId);
    }

    public GraphEdgeDetails getEdgeDetails(UUID userId, String edgeId) {
        return nodeDetailsRepository.findEdgeDetails(userId, edgeId);
    }
}
