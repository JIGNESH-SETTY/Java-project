package com.airesearch.discovery;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository.ScoredChunk;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.search.dto.SearchRequest;
import com.airesearch.discovery.search.dto.SearchResultDto;
import com.airesearch.discovery.search.service.SearchService;
import com.airesearch.discovery.shared.enums.PaperVisibility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

class HybridSearchRankingTest {

    private AiService aiService;
    private DocumentChunkRepository chunkRepository;
    private PaperRepository paperRepository;
    private AuthorRepository authorRepository;
    private SearchService searchService;

    @BeforeEach
    void setUp() {
        aiService = Mockito.mock(AiService.class);
        chunkRepository = Mockito.mock(DocumentChunkRepository.class);
        paperRepository = Mockito.mock(PaperRepository.class);
        authorRepository = Mockito.mock(AuthorRepository.class);
        searchService = new SearchService(aiService, chunkRepository, paperRepository, authorRepository);
    }

    @Test
    @DisplayName("Should correctly combine semantic and lexical scores using configured weights")
    void testHybridScoreCombination() {
        UUID userId = UUID.randomUUID();
        UUID paperId = UUID.randomUUID();
        UUID chunkId = UUID.randomUUID();

        Paper mockPaper = new Paper(paperId, userId, "Attention Is All You Need", "Abstract", "10.1234/test",
                2017, "NeurIPS", "path", "COMPLETED", null, PaperVisibility.PUBLIC, Instant.now(), Instant.now());

        DocumentChunk mockChunk = new DocumentChunk(chunkId, paperId, 0, "Methodology", 2, 0, 100,
                "Multi-head self-attention computes representations across tokens.", 15, new float[384], "model", Instant.now());

        when(aiService.embed(any())).thenReturn(new float[384]);
        when(chunkRepository.searchSemantic(any(), anyInt(), any()))
                .thenReturn(List.of(new ScoredChunk(mockChunk, 0.90))); // Semantic score 0.90
        when(chunkRepository.searchLexical(any(), anyInt(), any()))
                .thenReturn(List.of(new ScoredChunk(mockChunk, 0.50))); // Lexical score 0.50

        when(paperRepository.findByIds(any())).thenReturn(List.of(mockPaper));
        when(authorRepository.findByPaperId(any())).thenReturn(List.of());

        // Test with 70% semantic, 30% lexical weight
        SearchRequest request = new SearchRequest("self-attention", "HYBRID", 0.70, null, null, null, null, null, 10);
        List<SearchResultDto> results = searchService.search(request, userId);

        assertNotNull(results);
        assertEquals(1, results.size());
        SearchResultDto res = results.get(0);

        assertEquals(0.90, res.semanticScore(), 0.001);
        assertEquals(0.50, res.lexicalScore(), 0.001);

        // Expected: (0.7 * 0.90) + (0.3 * 0.50) = 0.63 + 0.15 = 0.78
        assertEquals(0.78, res.combinedScore(), 0.001);
        assertTrue(res.snippet().contains("self-attention") || res.snippet().contains("representations"));
    }
}
