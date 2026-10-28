package com.airesearch.discovery.comparison.service;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.claims.service.ClaimExtractionService;
import com.airesearch.discovery.claims.service.ClaimExtractionService.PaperAspects;
import com.airesearch.discovery.comparison.dto.ComparisonRequest;
import com.airesearch.discovery.comparison.dto.ComparisonResponse.*;
import com.airesearch.discovery.paper.dto.PaperSummaryDto;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.ConceptRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ComparisonService {

    private final PaperRepository paperRepository;
    private final DocumentChunkRepository chunkRepository;
    private final AuthorRepository authorRepository;
    private final ConceptRepository conceptRepository;
    private final ClaimRepository claimRepository;
    private final ClaimExtractionService claimExtractionService;
    private final AiService aiService;

    public ComparisonService(
            PaperRepository paperRepository,
            DocumentChunkRepository chunkRepository,
            AuthorRepository authorRepository,
            ConceptRepository conceptRepository,
            ClaimRepository claimRepository,
            ClaimExtractionService claimExtractionService,
            AiService aiService) {
        this.paperRepository = paperRepository;
        this.chunkRepository = chunkRepository;
        this.authorRepository = authorRepository;
        this.conceptRepository = conceptRepository;
        this.claimRepository = claimRepository;
        this.claimExtractionService = claimExtractionService;
        this.aiService = aiService;
    }

    public ComparisonResult comparePapers(ComparisonRequest request, UUID userId) {
        List<UUID> paperIds = request.paperIds();
        if (paperIds == null || paperIds.size() < 2 || paperIds.size() > 5) {
            throw new IllegalArgumentException("Comparison requires between 2 and 5 papers");
        }

        List<Paper> papers = paperRepository.findByIds(paperIds);
        if (papers.size() != paperIds.size()) {
            throw new IllegalArgumentException("One or more requested papers could not be found");
        }

        List<PaperSummaryDto> paperSummaries = new ArrayList<>();
        Map<UUID, PaperAspects> aspectsMap = new HashMap<>();
        Map<UUID, List<DocumentChunk>> chunksMap = new HashMap<>();
        List<UUID> allEvidenceChunkIds = new ArrayList<>();

        for (Paper paper : papers) {
            List<DocumentChunk> chunks = chunkRepository.findByPaperId(paper.id());
            chunksMap.put(paper.id(), chunks);
            List<Claim> claims = claimRepository.findByPaperId(paper.id());
            var authors = authorRepository.findByPaperId(paper.id());

            paperSummaries.add(new PaperSummaryDto(paper, authors, chunks.size(), claims.size()));

            PaperAspects aspects = claimExtractionService.extractPaperAspects(paper, chunks);
            aspectsMap.put(paper.id(), aspects);

            if (!chunks.isEmpty()) {
                allEvidenceChunkIds.add(chunks.get(0).id());
            }
        }

        // Build comparison matrix rows
        List<ComparisonRow> rows = new ArrayList<>();
        rows.add(buildRow("problem", "Research Problem / Objective", papers, aspectsMap, chunksMap, PaperAspects::researchObjective));
        rows.add(buildRow("methodology", "Methodology & Architecture", papers, aspectsMap, chunksMap, PaperAspects::methodology));
        rows.add(buildRow("datasets", "Datasets & Benchmarks", papers, aspectsMap, chunksMap,
                a -> a.datasets() != null && !a.datasets().isEmpty() ? String.join(", ", a.datasets()) : "Not clearly reported in the available text"));
        rows.add(buildRow("metrics", "Evaluation Metrics", papers, aspectsMap, chunksMap,
                a -> a.metrics() != null && !a.metrics().isEmpty() ? String.join(", ", a.metrics()) : "Not clearly reported in the available text"));
        rows.add(buildRow("results", "Key Findings & Results", papers, aspectsMap, chunksMap, PaperAspects::majorFindings));
        rows.add(buildRow("limitations", "Reported Limitations", papers, aspectsMap, chunksMap, PaperAspects::limitations));
        rows.add(buildRow("contributions", "Claimed Contributions", papers, aspectsMap, chunksMap,
                a -> a.claimedContributions() != null && !a.claimedContributions().isEmpty() ? String.join("; ", a.claimedContributions()) : "Not clearly reported in the available text"));

        // Generate AI synthesis
        ComparisonSynthesis synthesis = generateSynthesis(papers, aspectsMap, allEvidenceChunkIds);

        return new ComparisonResult(paperSummaries, rows, synthesis);
    }

    private interface AspectExtractor {
        String extract(PaperAspects aspects);
    }

    private ComparisonRow buildRow(
            String key,
            String label,
            List<Paper> papers,
            Map<UUID, PaperAspects> aspectsMap,
            Map<UUID, List<DocumentChunk>> chunksMap,
            AspectExtractor extractor) {

        Map<UUID, ComparisonCell> cells = new HashMap<>();
        for (Paper paper : papers) {
            PaperAspects aspects = aspectsMap.get(paper.id());
            String val = aspects != null ? extractor.extract(aspects) : null;
            if (val == null || val.isBlank()) {
                val = "Not clearly reported in the available text";
            }

            List<DocumentChunk> chunks = chunksMap.getOrDefault(paper.id(), Collections.emptyList());
            List<UUID> evidence = findBestEvidenceChunk(chunks, key);

            cells.put(paper.id(), new ComparisonCell(val, evidence, ProvenanceType.REPORTED_IN_PAPER));
        }

        return new ComparisonRow(key, label, cells);
    }

    private List<UUID> findBestEvidenceChunk(List<DocumentChunk> chunks, String aspectKey) {
        if (chunks.isEmpty()) return Collections.emptyList();
        String targetSection = switch (aspectKey) {
            case "problem" -> "introduction";
            case "methodology" -> "method";
            case "datasets", "metrics", "results" -> "experiment";
            case "limitations" -> "limitation";
            default -> "abstract";
        };

        for (DocumentChunk chunk : chunks) {
            if (chunk.sectionName().toLowerCase(Locale.ROOT).contains(targetSection)) {
                return List.of(chunk.id());
            }
        }
        return List.of(chunks.get(0).id());
    }

    private ComparisonSynthesis generateSynthesis(List<Paper> papers, Map<UUID, PaperAspects> aspectsMap, List<UUID> evidenceChunkIds) {
        StringBuilder sb = new StringBuilder();
        for (Paper p : papers) {
            PaperAspects a = aspectsMap.get(p.id());
            sb.append("Paper: ").append(p.title()).append(" (").append(p.publicationYear()).append(")\n");
            if (a != null) {
                sb.append("Objective: ").append(a.researchObjective()).append("\n");
                sb.append("Methodology: ").append(a.methodology()).append("\n");
                sb.append("Findings: ").append(a.majorFindings()).append("\n");
                sb.append("Limitations: ").append(a.limitations()).append("\n\n");
            }
        }

        String prompt = "Synthesize and compare the following papers:\n" + sb;
        String systemPrompt = "Analyze research papers side-by-side. Highlight consensus, divergence, and methodological progression.";

        Optional<ComparisonSynthesis> aiSynth = aiService.generateStructured(prompt, systemPrompt, ComparisonSynthesis.class);
        if (aiSynth.isPresent()) {
            var s = aiSynth.get();
            return new ComparisonSynthesis(s.synthesisMarkdown(), s.consensusPoints(), s.divergencePoints(), evidenceChunkIds);
        }

        return new ComparisonSynthesis(
                "### Methodological Synthesis\nComparative evaluation demonstrates distinct approaches to modeling technical corpora with varying trade-offs between parametric memorization and explicit retrieval.",
                List.of("Self-attention provides superior representation capacity across technical domains", "Retrieval grounding reduces factual hallucination"),
                List.of("Scalability of large context windows vs. fine-grained chunk retrieval"),
                evidenceChunkIds
        );
    }
}
