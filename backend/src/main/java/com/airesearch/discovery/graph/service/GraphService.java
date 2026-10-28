package com.airesearch.discovery.graph.service;

import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.repository.ClaimRelationRepository;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.graph.dto.GraphDtos.*;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.ConceptRepository;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.paper.repository.ReferenceRepository;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphService {

    private final PaperRepository paperRepository;
    private final ReferenceRepository referenceRepository;
    private final ConceptRepository conceptRepository;
    private final ClaimRepository claimRepository;
    private final ClaimRelationRepository claimRelationRepository;
    private final AuthorRepository authorRepository;

    public GraphService(
            PaperRepository paperRepository,
            ReferenceRepository referenceRepository,
            ConceptRepository conceptRepository,
            ClaimRepository claimRepository,
            ClaimRelationRepository claimRelationRepository,
            AuthorRepository authorRepository) {
        this.paperRepository = paperRepository;
        this.referenceRepository = referenceRepository;
        this.conceptRepository = conceptRepository;
        this.claimRepository = claimRepository;
        this.claimRelationRepository = claimRelationRepository;
        this.authorRepository = authorRepository;
    }

    public GraphResponse getCitationGraph(UUID userId) {
        List<Paper> papers = paperRepository.findAllAccessible(userId, 100, 0);
        Set<UUID> paperIds = new HashSet<>();
        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();

        for (Paper p : papers) {
            paperIds.add(p.id());
            var authors = authorRepository.findByPaperId(p.id());
            String authorNames = authors.isEmpty() ? "Unknown" : authors.get(0).displayName() + (authors.size() > 1 ? " et al." : "");

            nodes.add(new GraphNode(
                    p.id().toString(),
                    p.title(),
                    "PAPER",
                    Map.of(
                            "title", p.title(),
                            "year", p.publicationYear() != null ? p.publicationYear() : "N/A",
                            "venue", p.venue() != null ? p.venue() : "",
                            "authors", authorNames
                    )
            ));
        }

        // Citations / references
        int edgeCount = 0;
        for (Paper p : papers) {
            var refs = referenceRepository.findBySourcePaperId(p.id());
            for (var ref : refs) {
                if (ref.citedPaperId() != null && paperIds.contains(ref.citedPaperId())) {
                    edges.add(new GraphEdge(
                            "cite_" + (++edgeCount),
                            p.id().toString(),
                            ref.citedPaperId().toString(),
                            "cites",
                            "CITES",
                            ProvenanceType.REPORTED_IN_PAPER,
                            1.0,
                            "Direct bibliographic citation extracted from source paper",
                            false
                    ));
                } else if (ref.citedTitle() != null && !ref.citedTitle().isBlank()) {
                    // Create unresolved node if not present
                    String unresId = "unresolved_" + Math.abs(ref.citedTitle().hashCode());
                    boolean exists = nodes.stream().anyMatch(n -> n.id().equals(unresId));
                    if (!exists && nodes.size() < 120) {
                        nodes.add(new GraphNode(
                                unresId,
                                ref.citedTitle(),
                                "UNRESOLVED_PAPER",
                                Map.of("title", ref.citedTitle(), "status", "Unresolved External Reference")
                        ));
                    }
                    if (nodes.size() < 120) {
                        edges.add(new GraphEdge(
                                "cite_unres_" + (++edgeCount),
                                p.id().toString(),
                                unresId,
                                "cites (external)",
                                "CITES_UNRESOLVED",
                                ProvenanceType.REPORTED_IN_PAPER,
                                0.8,
                                "Unresolved external reference",
                                false
                        ));
                    }
                }
            }
        }

        return new GraphResponse(nodes, edges, nodes.size(), edges.size());
    }

    public GraphResponse getConceptGraph(UUID userId) {
        List<Paper> papers = paperRepository.findAllAccessible(userId, 50, 0);
        List<GraphNode> nodes = new ArrayList<>();
        List<GraphEdge> edges = new ArrayList<>();
        Set<String> nodeIds = new HashSet<>();
        int edgeCount = 0;

        // Paper nodes
        for (Paper p : papers) {
            String pId = "paper_" + p.id();
            nodeIds.add(pId);
            nodes.add(new GraphNode(
                    pId,
                    p.title(),
                    "PAPER",
                    Map.of("title", p.title(), "year", p.publicationYear() != null ? p.publicationYear() : "N/A")
            ));

            // Concepts for paper
            var concepts = conceptRepository.findByPaperId(p.id());
            for (var pc : concepts) {
                String cId = "concept_" + pc.conceptId();
                if (!nodeIds.contains(cId)) {
                    nodeIds.add(cId);
                    nodes.add(new GraphNode(
                            cId,
                            pc.conceptName(),
                            pc.conceptType().name(),
                            Map.of("name", pc.conceptName(), "type", pc.conceptType().name())
                    ));
                }

                edges.add(new GraphEdge(
                        "edge_concept_" + (++edgeCount),
                        pId,
                        cId,
                        pc.relationType().toLowerCase(Locale.ROOT),
                        pc.relationType(),
                        pc.provenanceType(),
                        pc.confidence(),
                        "Paper asserts concept association",
                        pc.provenanceType() == ProvenanceType.AI_INTERPRETATION
                ));
            }

            // Claims for paper
            var claims = claimRepository.findByPaperId(p.id());
            for (Claim c : claims) {
                String clId = "claim_" + c.id();
                if (!nodeIds.contains(clId)) {
                    nodeIds.add(clId);
                    nodes.add(new GraphNode(
                            clId,
                            c.normalizedText(),
                            "CLAIM",
                            Map.of("text", c.normalizedText(), "type", c.claimType().name(), "section", c.sectionName() != null ? c.sectionName() : "")
                    ));
                }

                edges.add(new GraphEdge(
                        "edge_claim_" + (++edgeCount),
                        pId,
                        clId,
                        "reports",
                        "REPORTS_CLAIM",
                        c.provenanceType(),
                        c.extractionConfidence(),
                        "Reported claim grounded in paper chunk",
                        c.provenanceType() == ProvenanceType.AI_INTERPRETATION
                ));
            }
        }

        // Cross-claim relationships
        List<ClaimRelation> relations = claimRelationRepository.findAll();
        for (ClaimRelation r : relations) {
            String sId = "claim_" + r.sourceClaimId();
            String tId = "claim_" + r.targetClaimId();

            if (nodeIds.contains(sId) && nodeIds.contains(tId)) {
                edges.add(new GraphEdge(
                        "edge_rel_" + (++edgeCount),
                        sId,
                        tId,
                        r.relationType().name().toLowerCase(Locale.ROOT),
                        r.relationType().name(),
                        r.provenanceType(),
                        r.confidence(),
                        r.rationale(),
                        r.provenanceType() == ProvenanceType.AI_INTERPRETATION
                ));
            }
        }

        return new GraphResponse(nodes, edges, nodes.size(), edges.size());
    }
}
