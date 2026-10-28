package com.airesearch.discovery;

import com.airesearch.discovery.claims.dto.ClaimDtos.CreateRelationRequest;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.repository.ClaimRelationRepository;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.claims.service.ClaimService;
import com.airesearch.discovery.shared.enums.ClaimType;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import com.airesearch.discovery.shared.enums.RelationType;
import com.airesearch.discovery.shared.enums.ReviewStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ClaimRelationValidationTest {

    private ClaimRepository claimRepository;
    private ClaimRelationRepository claimRelationRepository;
    private ClaimService claimService;

    @BeforeEach
    void setUp() {
        claimRepository = Mockito.mock(ClaimRepository.class);
        claimRelationRepository = Mockito.mock(ClaimRelationRepository.class);
        claimService = new ClaimService(claimRepository, claimRelationRepository, null);
    }

    @Test
    @DisplayName("Should reject self-referential claim relationship")
    void testDisallowSelfReferentialRelation() {
        UUID claimId = UUID.randomUUID();
        CreateRelationRequest request = new CreateRelationRequest(
                claimId,
                RelationType.SUPPORTS,
                0.9,
                "Identical claims cannot support themselves",
                List.of()
        );

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                claimService.createRelation(claimId, request, UUID.randomUUID()));

        assertTrue(ex.getMessage().contains("relationship with itself"));
    }

    @Test
    @DisplayName("Should assign USER_ASSERTED provenance when user asserts a claim relation")
    void testUserAssertedProvenance() {
        UUID claimA = UUID.randomUUID();
        UUID claimB = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Claim mockClaimA = new Claim(claimA, UUID.randomUUID(), UUID.randomUUID(), "Finding A", "Text A",
                ClaimType.FINDING, ProvenanceType.REPORTED_IN_PAPER, 1.0, "Results", 2, userId, Instant.now(), Instant.now());
        Claim mockClaimB = new Claim(claimB, UUID.randomUUID(), UUID.randomUUID(), "Finding B", "Text B",
                ClaimType.FINDING, ProvenanceType.REPORTED_IN_PAPER, 1.0, "Results", 3, userId, Instant.now(), Instant.now());

        when(claimRepository.findById(claimA)).thenReturn(Optional.of(mockClaimA));
        when(claimRepository.findById(claimB)).thenReturn(Optional.of(mockClaimB));
        when(claimRelationRepository.save(any(), any())).thenAnswer(inv -> inv.getArgument(0));

        CreateRelationRequest request = new CreateRelationRequest(
                claimB,
                RelationType.QUALIFIES,
                0.92,
                "Study B qualifies Study A under high temperatures.",
                List.of()
        );

        ClaimRelation created = claimService.createRelation(claimA, request, userId);

        assertNotNull(created);
        assertEquals(ProvenanceType.USER_ASSERTED, created.provenanceType());
        assertEquals(ReviewStatus.CONFIRMED, created.reviewStatus());
        assertEquals(RelationType.QUALIFIES, created.relationType());
        verify(claimRelationRepository, times(1)).save(any(), any());
    }

    @Test
    @DisplayName("Should update review status of relation to CONFIRMED or REJECTED")
    void testUpdateReviewStatus() {
        UUID relationId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        ClaimRelation existing = new ClaimRelation(relationId, UUID.randomUUID(), UUID.randomUUID(),
                RelationType.CONTRADICTS, 0.85, "Contradictory findings",
                ProvenanceType.AI_INTERPRETATION, ReviewStatus.PENDING, userId,
                Instant.now(), Instant.now(), List.of());

        when(claimRelationRepository.findById(relationId)).thenReturn(Optional.of(existing));

        claimService.updateRelationReviewStatus(relationId, ReviewStatus.CONFIRMED, userId);

        verify(claimRelationRepository, times(1)).updateReviewStatus(relationId, ReviewStatus.CONFIRMED);
    }
}
