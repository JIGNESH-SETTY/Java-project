package com.airesearch.discovery;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.review.dto.ReviewDtos.*;
import com.airesearch.discovery.review.repository.ReviewRepository;
import com.airesearch.discovery.review.service.LiteratureReviewService;
import com.airesearch.discovery.search.dto.SearchResultDto;
import com.airesearch.discovery.search.service.SearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class LiteratureReviewEvidenceMappingTest {

    private SearchService searchService;
    private ReviewRepository reviewRepository;
    private DocumentChunkRepository chunkRepository;
    private PaperRepository paperRepository;
    private AuthorRepository authorRepository;
    private AiService aiService;
    private LiteratureReviewService reviewService;

    @BeforeEach
    void setUp() {
        searchService = Mockito.mock(SearchService.class);
        reviewRepository = Mockito.mock(ReviewRepository.class);
        chunkRepository = Mockito.mock(DocumentChunkRepository.class);
        paperRepository = Mockito.mock(PaperRepository.class);
        authorRepository = Mockito.mock(AuthorRepository.class);
        aiService = Mockito.mock(AiService.class);
        reviewService = new LiteratureReviewService(searchService, reviewRepository, chunkRepository, paperRepository, authorRepository, aiService);
    }

    @Test
    @DisplayName("Should issue coverage warning when fewer than 2 distinct papers are retrieved")
    void testCoverageWarningForSmallCorpus() {
        UUID userId = UUID.randomUUID();
        UUID paperId = UUID.randomUUID();
        UUID chunkId = UUID.randomUUID();

        SearchResultDto match = new SearchResultDto(
                chunkId, paperId, "Single Isolated Paper", 2024, "Venue",
                List.of("Author"), "Results", 1, 0,
                "Empirical evidence snippet", 0.95, 0.95, 0.95, "Rationale"
        );

        when(searchService.search(any(), any())).thenReturn(List.of(match));
        when(aiService.generateStructured(any(), any(), any())).thenReturn(Optional.empty()); // Uses fallback review

        GenerateReviewRequest req = new GenerateReviewRequest("How does Method X perform?", null, null, "Brief", null);
        ReviewDetailDto review = reviewService.generateReview(req, userId);

        assertNotNull(review);
        assertNotNull(review.coverageWarning());
        assertTrue(review.coverageWarning().contains("fewer than 2 distinct papers"));
        assertFalse(review.evidence().isEmpty());
    }
}
