package com.airesearch.discovery.claims.service;

import com.airesearch.discovery.claims.dto.ClaimDtos.*;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.repository.ClaimRelationRepository;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import com.airesearch.discovery.shared.enums.ReviewStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final ClaimRelationRepository claimRelationRepository;
    private final PaperRepository paperRepository;

    public ClaimService(
            ClaimRepository claimRepository,
            ClaimRelationRepository claimRelationRepository,
            PaperRepository paperRepository) {
        this.claimRepository = claimRepository;
        this.claimRelationRepository = claimRelationRepository;
        this.paperRepository = paperRepository;
    }

    public List<Claim> listClaims(UUID userId, int page, int size) {
        int offset = page * size;
        return claimRepository.findAllAccessible(userId, size, offset);
    }

    public ClaimDetailDto getClaimDetail(UUID claimId, UUID userId) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

        String paperTitle = "Independent Claim";
        if (claim.paperId() != null) {
            paperTitle = paperRepository.findById(claim.paperId())
                    .map(Paper::title)
                    .orElse("Unknown Paper");
        }

        List<ClaimRelation> relations = claimRelationRepository.findByClaimId(claimId);
        return new ClaimDetailDto(claim, paperTitle, relations);
    }

    @Transactional
    public Claim createClaim(CreateClaimRequest request, UUID userId) {
        Claim claim = new Claim(
                UUID.randomUUID(),
                request.paperId(),
                request.sourceChunkId(),
                request.normalizedText(),
                request.sourceText(),
                request.claimType(),
                ProvenanceType.USER_ASSERTED,
                1.0,
                request.sectionName() != null ? request.sectionName() : "User Added",
                request.pageNumber(),
                userId,
                Instant.now(),
                Instant.now()
        );
        return claimRepository.save(claim);
    }

    @Transactional
    public Claim updateClaim(UUID claimId, UpdateClaimRequest request, UUID userId) {
        Claim existing = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

        Claim updated = new Claim(
                existing.id(),
                existing.paperId(),
                existing.sourceChunkId(),
                request.normalizedText() != null ? request.normalizedText() : existing.normalizedText(),
                request.sourceText() != null ? request.sourceText() : existing.sourceText(),
                request.claimType() != null ? request.claimType() : existing.claimType(),
                existing.provenanceType(),
                existing.extractionConfidence(),
                request.sectionName() != null ? request.sectionName() : existing.sectionName(),
                request.pageNumber() != null ? request.pageNumber() : existing.pageNumber(),
                existing.createdBy(),
                existing.createdAt(),
                Instant.now()
        );
        claimRepository.update(updated);
        return updated;
    }

    @Transactional
    public ClaimRelation createRelation(UUID sourceClaimId, CreateRelationRequest request, UUID userId) {
        if (sourceClaimId.equals(request.targetClaimId())) {
            throw new IllegalArgumentException("A claim cannot have a relationship with itself");
        }

        claimRepository.findById(sourceClaimId)
                .orElseThrow(() -> new IllegalArgumentException("Source claim not found"));
        claimRepository.findById(request.targetClaimId())
                .orElseThrow(() -> new IllegalArgumentException("Target claim not found"));

        ClaimRelation relation = new ClaimRelation(
                UUID.randomUUID(),
                sourceClaimId,
                request.targetClaimId(),
                request.relationType(),
                request.confidence() != null ? request.confidence() : 1.0,
                request.rationale(),
                ProvenanceType.USER_ASSERTED,
                ReviewStatus.CONFIRMED,
                userId,
                Instant.now(),
                Instant.now(),
                request.evidenceChunkIds() != null ? request.evidenceChunkIds() : Collections.emptyList()
        );

        return claimRelationRepository.save(relation, relation.evidenceChunkIds());
    }

    @Transactional
    public void updateRelationReviewStatus(UUID relationId, ReviewStatus status, UUID userId) {
        claimRelationRepository.findById(relationId)
                .orElseThrow(() -> new IllegalArgumentException("Claim relation not found with ID: " + relationId));
        claimRelationRepository.updateReviewStatus(relationId, status);
    }

    public List<ClaimRelation> listRelations(UUID userId) {
        return claimRelationRepository.findAll();
    }
}
