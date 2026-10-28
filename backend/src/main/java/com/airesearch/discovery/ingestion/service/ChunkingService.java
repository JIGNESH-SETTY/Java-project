package com.airesearch.discovery.ingestion.service;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.ingestion.parser.DocumentParser.ParsedDocument;
import com.airesearch.discovery.ingestion.parser.DocumentParser.ParsedPage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

/**
 * Intelligent semantic chunking engine. Respects section boundaries,
 * maintains token overlap, and records source offsets and page numbers.
 */
@Service
public class ChunkingService {

    private static final Logger log = LoggerFactory.getLogger(ChunkingService.class);

    private static final int TARGET_CHUNK_CHARS = 1800; // ~450 tokens
    private static final int OVERLAP_CHARS = 300;       // ~75 tokens

    private static final List<String> SECTION_MARKERS = List.of(
            "abstract", "introduction", "related work", "background",
            "methodology", "method", "architecture", "model",
            "experimental setup", "experiments", "evaluation",
            "results", "discussion", "limitations", "conclusion",
            "future work", "references"
    );

    private final AiService aiService;

    public ChunkingService(AiService aiService) {
        this.aiService = aiService;
    }

    public record ChunkRecord(
            int chunkIndex,
            String sectionName,
            int pageNumber,
            int charStart,
            int charEnd,
            String content,
            int tokenCount,
            float[] embedding
    ) {}

    public List<ChunkRecord> chunkDocument(ParsedDocument document) {
        List<ChunkRecord> chunks = new ArrayList<>();
        int chunkIndex = 0;
        int globalCharOffset = 0;
        String currentSection = "Introduction";

        // Build continuous stream of text while preserving page number index
        for (ParsedPage page : document.pages()) {
            String pageText = page.text();
            int pageStartOffset = globalCharOffset;
            int pageTextLen = pageText.length();

            // Detect section headers within the page
            String[] paragraphs = pageText.split("\n\n+");
            StringBuilder currentChunkText = new StringBuilder();
            int chunkStartChar = globalCharOffset;

            for (String para : paragraphs) {
                String trimmedPara = para.trim();
                if (trimmedPara.isEmpty()) continue;

                // Check if this paragraph is a section header
                String detectedSection = detectSectionHeader(trimmedPara);
                if (detectedSection != null) {
                    // Flush existing chunk before changing section
                    if (currentChunkText.length() > 200) {
                        String content = currentChunkText.toString().trim();
                        int tokenEst = Math.max(1, content.length() / 4);
                        chunks.add(new ChunkRecord(
                                chunkIndex++,
                                currentSection,
                                page.pageNumber(),
                                chunkStartChar,
                                chunkStartChar + content.length(),
                                content,
                                tokenEst,
                                null // Will compute batch embeddings
                        ));
                        currentChunkText.setLength(0);
                    }
                    currentSection = detectedSection;
                    chunkStartChar = globalCharOffset;
                }

                if (currentChunkText.length() + trimmedPara.length() > TARGET_CHUNK_CHARS) {
                    if (currentChunkText.length() > 0) {
                        String content = currentChunkText.toString().trim();
                        int tokenEst = Math.max(1, content.length() / 4);
                        chunks.add(new ChunkRecord(
                                chunkIndex++,
                                currentSection,
                                page.pageNumber(),
                                chunkStartChar,
                                chunkStartChar + content.length(),
                                content,
                                tokenEst,
                                null
                        ));

                        // Maintain overlap
                        String overlap = getOverlapText(content, OVERLAP_CHARS);
                        currentChunkText.setLength(0);
                        currentChunkText.append(overlap).append("\n\n");
                        chunkStartChar = globalCharOffset - overlap.length();
                    }
                }

                currentChunkText.append(trimmedPara).append("\n\n");
                globalCharOffset += trimmedPara.length() + 2;
            }

            // Flush remaining chunk for page if substantial
            if (currentChunkText.length() > 150) {
                String content = currentChunkText.toString().trim();
                int tokenEst = Math.max(1, content.length() / 4);
                chunks.add(new ChunkRecord(
                        chunkIndex++,
                        currentSection,
                        page.pageNumber(),
                        chunkStartChar,
                        chunkStartChar + content.length(),
                        content,
                        tokenEst,
                        null
                ));
            }
        }

        // If no chunks created (e.g. empty or very short PDF), create at least one chunk from title/abstract
        if (chunks.isEmpty()) {
            String fallbackContent = (document.title() + "\n\n" + (document.abstractText() != null ? document.abstractText() : "")).trim();
            chunks.add(new ChunkRecord(
                    0,
                    "Overview",
                    1,
                    0,
                    fallbackContent.length(),
                    fallbackContent,
                    fallbackContent.length() / 4,
                    null
            ));
        }

        // Compute batch embeddings for all chunks
        List<String> chunkTexts = chunks.stream().map(ChunkRecord::content).toList();
        List<float[]> embeddings = aiService.embedBatch(chunkTexts);

        List<ChunkRecord> finalizedChunks = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            ChunkRecord c = chunks.get(i);
            float[] emb = i < embeddings.size() ? embeddings.get(i) : new float[aiService.getEmbeddingDimension()];
            finalizedChunks.add(new ChunkRecord(
                    c.chunkIndex(),
                    c.sectionName(),
                    c.pageNumber(),
                    c.charStart(),
                    c.charEnd(),
                    c.content(),
                    c.tokenCount(),
                    emb
            ));
        }

        log.info("Chunking completed: produced {} chunks for document '{}'", finalizedChunks.size(), document.title());
        return finalizedChunks;
    }

    private String detectSectionHeader(String paragraph) {
        if (paragraph.length() > 80) return null; // Section titles are brief
        String lower = paragraph.toLowerCase(Locale.ROOT).trim();
        for (String marker : SECTION_MARKERS) {
            if (lower.equals(marker) || lower.startsWith(marker + " ") || lower.matches("^[0-9]+[\\.\\s]+" + marker + ".*")) {
                return capitalizeWords(paragraph);
            }
        }
        return null;
    }

    private String getOverlapText(String text, int overlapChars) {
        if (text.length() <= overlapChars) return text;
        int start = text.length() - overlapChars;
        // Try to break at a sentence or word boundary
        int spaceIdx = text.indexOf(' ', start);
        if (spaceIdx != -1 && spaceIdx < text.length() - 20) {
            return text.substring(spaceIdx + 1);
        }
        return text.substring(start);
    }

    private String capitalizeWords(String text) {
        String clean = text.replaceAll("[^a-zA-Z0-9 ]", "").trim();
        if (clean.length() > 40) clean = clean.substring(0, 40);
        return clean.isEmpty() ? "Section" : clean;
    }
}
