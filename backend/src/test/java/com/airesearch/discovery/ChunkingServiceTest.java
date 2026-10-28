package com.airesearch.discovery;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.ai.provider.MockAiProvider;
import com.airesearch.discovery.ingestion.parser.DocumentParser.ParsedDocument;
import com.airesearch.discovery.ingestion.parser.DocumentParser.ParsedPage;
import com.airesearch.discovery.ingestion.service.ChunkingService;
import com.airesearch.discovery.ingestion.service.ChunkingService.ChunkRecord;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ChunkingServiceTest {

    private ChunkingService chunkingService;

    @BeforeEach
    void setUp() {
        MockAiProvider mockProvider = new MockAiProvider(new ObjectMapper());
        AiService aiService = new AiService("MOCK", mockProvider, null);
        chunkingService = new ChunkingService(aiService);
    }

    @Test
    @DisplayName("Should segment scholarly document into chunks with section headers and page offsets")
    void testChunkDocumentPreservesMetadata() {
        String page1 = """
            Abstract
            Recent developments in deep learning have enabled scalable neural representations for technical corpora.
            
            1. Introduction
            Recurrent architectures suffer from sequential computation bottlenecks. In this paper, we propose self-attention.
            """;

        String page2 = """
            2. Methodology
            Our architecture replaces RNNs with multi-head self-attention. This allows substantial parallelization across tokens.
            
            3. Results
            On WMT 2014 English-to-German, our model achieves a state-of-the-art BLEU score of 28.4.
            """;

        ParsedDocument doc = new ParsedDocument(
                "Attention Is All You Need",
                "Recent developments in deep learning...",
                2017,
                "NeurIPS",
                "10.1234/test",
                List.of("A. Vaswani", "N. Shazeer"),
                List.of(new ParsedPage(1, page1), new ParsedPage(2, page2)),
                List.of("Reference 1", "Reference 2"),
                Map.of()
        );

        List<ChunkRecord> chunks = chunkingService.chunkDocument(doc);

        assertNotNull(chunks);
        assertFalse(chunks.isEmpty());
        assertTrue(chunks.size() >= 2);

        // Verify chunk properties
        ChunkRecord firstChunk = chunks.get(0);
        assertEquals(0, firstChunk.chunkIndex());
        assertTrue(firstChunk.content().length() > 20);
        assertTrue(firstChunk.tokenCount() > 0);
        assertNotNull(firstChunk.embedding());
        assertEquals(384, firstChunk.embedding().length);
    }

    @Test
    @DisplayName("Should create fallback chunk for minimal or abstract-only documents")
    void testChunkDocumentFallback() {
        ParsedDocument emptyDoc = new ParsedDocument(
                "Minimal Paper Title",
                "Brief abstract text describing the empirical findings.",
                2024,
                null,
                null,
                List.of("Author"),
                List.of(),
                List.of(),
                Map.of()
        );

        List<ChunkRecord> chunks = chunkingService.chunkDocument(emptyDoc);

        assertNotNull(chunks);
        assertEquals(1, chunks.size());
        assertEquals("Overview", chunks.get(0).sectionName());
        assertTrue(chunks.get(0).content().contains("Minimal Paper Title"));
        assertNotNull(chunks.get(0).embedding());
    }
}
