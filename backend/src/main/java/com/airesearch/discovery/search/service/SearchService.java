package com.airesearch.discovery.search.service;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository.ScoredChunk;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.search.dto.SearchRequest;
import com.airesearch.discovery.search.dto.SearchResultDto;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final AiService aiService;
    private final DocumentChunkRepository chunkRepository;
    private final PaperRepository paperRepository;
    private final AuthorRepository authorRepository;

    public SearchService(
            AiService aiService,
            DocumentChunkRepository chunkRepository,
            PaperRepository paperRepository,
            AuthorRepository authorRepository) {
        this.aiService = aiService;
        this.chunkRepository = chunkRepository;
        this.paperRepository = paperRepository;
        this.authorRepository = authorRepository;
    }

    public List<SearchResultDto> search(SearchRequest request, UUID userId) {
        String query = request.query() != null ? request.query().trim() : "";
        if (query.isEmpty()) return Collections.emptyList();

        int topK = request.topK();
        double semanticWeight = request.semanticWeight();
        String mode = request.searchMode().toUpperCase(Locale.ROOT);

        Map<UUID, Double> semanticScores = new HashMap<>();
        Map<UUID, Double> lexicalScores = new HashMap<>();
        Map<UUID, DocumentChunk> chunkMap = new HashMap<>();

        if ("HYBRID".equals(mode) || "SEMANTIC".equals(mode)) {
            float[] queryVector = aiService.embed(query);
            List<ScoredChunk> semanticMatches = chunkRepository.searchSemantic(queryVector, topK * 2, userId);
            for (ScoredChunk sc : semanticMatches) {
                semanticScores.put(sc.chunk().id(), Math.max(0.0, Math.min(1.0, sc.score())));
                chunkMap.put(sc.chunk().id(), sc.chunk());
            }
        }

        if ("HYBRID".equals(mode) || "LEXICAL".equals(mode)) {
            List<ScoredChunk> lexicalMatches = chunkRepository.searchLexical(query, topK * 2, userId);
            for (ScoredChunk sc : lexicalMatches) {
                lexicalScores.put(sc.chunk().id(), Math.max(0.0, Math.min(1.0, sc.score())));
                chunkMap.put(sc.chunk().id(), sc.chunk());
            }
        }

        // Fetch parent papers to apply filters (year, author, venue)
        Set<UUID> paperIds = chunkMap.values().stream().map(DocumentChunk::paperId).collect(Collectors.toSet());
        Map<UUID, Paper> paperMap = paperRepository.findByIds(new ArrayList<>(paperIds)).stream()
                .collect(Collectors.toMap(Paper::id, p -> p));

        Map<UUID, List<String>> authorMap = new HashMap<>();
        for (UUID pId : paperIds) {
            List<String> authors = authorRepository.findByPaperId(pId).stream()
                    .map(AuthorRepository.AuthorRecord::displayName)
                    .toList();
            authorMap.put(pId, authors);
        }

        List<SearchResultDto> results = new ArrayList<>();

        for (Map.Entry<UUID, DocumentChunk> entry : chunkMap.entrySet()) {
            UUID chunkId = entry.getKey();
            DocumentChunk chunk = entry.getValue();
            Paper paper = paperMap.get(chunk.paperId());
            if (paper == null) continue;

            // Apply filters
            if (request.yearFrom() != null && paper.publicationYear() != null && paper.publicationYear() < request.yearFrom()) continue;
            if (request.yearTo() != null && paper.publicationYear() != null && paper.publicationYear() > request.yearTo()) continue;
            if (request.venue() != null && !request.venue().isBlank() && paper.venue() != null &&
                    !paper.venue().toLowerCase(Locale.ROOT).contains(request.venue().toLowerCase(Locale.ROOT))) continue;

            List<String> authors = authorMap.getOrDefault(paper.id(), Collections.emptyList());
            if (request.author() != null && !request.author().isBlank()) {
                boolean matchAuthor = authors.stream().anyMatch(a -> a.toLowerCase(Locale.ROOT).contains(request.author().toLowerCase(Locale.ROOT)));
                if (!matchAuthor) continue;
            }

            double semScore = semanticScores.getOrDefault(chunkId, 0.0);
            double lexScore = lexicalScores.getOrDefault(chunkId, 0.0);
            double finalScore;

            if ("SEMANTIC".equals(mode)) {
                finalScore = semScore;
            } else if ("LEXICAL".equals(mode)) {
                finalScore = lexScore;
            } else {
                finalScore = (semanticWeight * semScore) + ((1.0 - semanticWeight) * lexScore);
            }

            String snippet = generateSnippet(chunk.content(), query);
            String rationale = String.format("Mode: %s (Semantic: %.2f * %.2f, Lexical: %.2f * %.2f)",
                    mode, semScore, semanticWeight, lexScore, (1.0 - semanticWeight));

            results.add(new SearchResultDto(
                    chunkId,
                    paper.id(),
                    paper.title(),
                    paper.publicationYear(),
                    paper.venue(),
                    authors,
                    chunk.sectionName(),
                    chunk.pageNumber(),
                    chunk.chunkIndex(),
                    snippet,
                    finalScore,
                    semScore,
                    lexScore,
                    rationale
            ));
        }

        results.sort((a, b) -> Double.compare(b.combinedScore(), a.combinedScore()));
        return results.subList(0, Math.min(topK, results.size()));
    }

    private String generateSnippet(String content, String query) {
        if (content.length() <= 300) return content;
        String lowerContent = content.toLowerCase(Locale.ROOT);
        String[] terms = query.toLowerCase(Locale.ROOT).split("\\s+");

        int matchIdx = -1;
        for (String term : terms) {
            if (term.length() > 3) {
                int idx = lowerContent.indexOf(term);
                if (idx != -1) {
                    matchIdx = idx;
                    break;
                }
            }
        }

        if (matchIdx == -1) {
            return content.substring(0, Math.min(content.length(), 280)) + "...";
        }

        int start = Math.max(0, matchIdx - 70);
        int end = Math.min(content.length(), matchIdx + 210);
        String sub = content.substring(start, end).trim();
        return (start > 0 ? "..." : "") + sub + (end < content.length() ? "..." : "");
    }
}
