package com.airesearch.discovery.claims.service;

import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;

import java.util.List;
import java.util.UUID;

public interface ClaimExtractionService {

    List<Claim> extractClaimsFromPaper(Paper paper, List<DocumentChunk> chunks);

    List<ClaimRelation> proposeRelationsForClaims(List<Claim> newClaims, UUID userId);

    record PaperAspects(
            String researchObjective,
            String methodology,
            List<String> datasets,
            List<String> metrics,
            String majorFindings,
            String limitations,
            List<String> claimedContributions
    ) {}

    PaperAspects extractPaperAspects(Paper paper, List<DocumentChunk> chunks);
}
