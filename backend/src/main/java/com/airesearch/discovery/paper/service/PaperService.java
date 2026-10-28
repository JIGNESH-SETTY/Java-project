package com.airesearch.discovery.paper.service;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.ingestion.model.IngestionJob;
import com.airesearch.discovery.ingestion.repository.IngestionJobRepository;
import com.airesearch.discovery.paper.dto.ManualPaperRequest;
import com.airesearch.discovery.paper.dto.PaperDetailDto;
import com.airesearch.discovery.paper.dto.PaperSummaryDto;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.AuthorRepository.AuthorRecord;
import com.airesearch.discovery.paper.repository.ConceptRepository;
import com.airesearch.discovery.paper.repository.DocumentChunkRepository;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.paper.repository.ReferenceRepository;
import com.airesearch.discovery.shared.enums.PaperVisibility;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class PaperService {

    private final PaperRepository paperRepository;
    private final DocumentChunkRepository chunkRepository;
    private final AuthorRepository authorRepository;
    private final ReferenceRepository referenceRepository;
    private final ConceptRepository conceptRepository;
    private final ClaimRepository claimRepository;
    private final IngestionJobRepository jobRepository;
    private final AiService aiService;

    public PaperService(
            PaperRepository paperRepository,
            DocumentChunkRepository chunkRepository,
            AuthorRepository authorRepository,
            ReferenceRepository referenceRepository,
            ConceptRepository conceptRepository,
            ClaimRepository claimRepository,
            IngestionJobRepository jobRepository,
            AiService aiService) {
        this.paperRepository = paperRepository;
        this.chunkRepository = chunkRepository;
        this.authorRepository = authorRepository;
        this.referenceRepository = referenceRepository;
        this.conceptRepository = conceptRepository;
        this.claimRepository = claimRepository;
        this.jobRepository = jobRepository;
        this.aiService = aiService;
    }

    @Transactional
    public Paper createManualPaper(ManualPaperRequest request, UUID userId) {
        UUID paperId = UUID.randomUUID();
        Paper paper = new Paper(
                paperId,
                userId,
                request.title(),
                request.abstractText(),
                request.doi(),
                request.publicationYear() != null ? request.publicationYear() : Calendar.getInstance().get(Calendar.YEAR),
                request.venue() != null ? request.venue() : "Manual Entry",
                null,
                "COMPLETED",
                null,
                request.visibility() != null ? request.visibility() : PaperVisibility.PRIVATE,
                Instant.now(),
                Instant.now()
        );

        Paper saved = paperRepository.save(paper);

        if (request.authors() != null) {
            int order = 1;
            for (String authorName : request.authors()) {
                AuthorRecord author = authorRepository.findOrCreate(authorName, null);
                authorRepository.linkPaperAuthor(saved.id(), author.id(), order++);
            }
        }

        // Create baseline chunk from title + abstract
        String content = (saved.title() + "\n\n" + (saved.abstractText() != null ? saved.abstractText() : "")).trim();
        float[] embedding = aiService.embed(content);
        DocumentChunk chunk = new DocumentChunk(
                UUID.randomUUID(),
                saved.id(),
                0,
                "Abstract",
                1,
                0,
                content.length(),
                content,
                content.length() / 4,
                embedding,
                aiService.getActiveProviderName(),
                Instant.now()
        );
        chunkRepository.saveBatch(List.of(chunk));

        return saved;
    }

    public List<PaperSummaryDto> listPapers(UUID userId, int page, int size) {
        int offset = page * size;
        List<Paper> papers = paperRepository.findAllAccessible(userId, size, offset);
        List<PaperSummaryDto> summaries = new ArrayList<>();

        for (Paper p : papers) {
            List<AuthorRecord> authors = authorRepository.findByPaperId(p.id());
            List<DocumentChunk> chunks = chunkRepository.findByPaperId(p.id());
            List<Claim> claims = claimRepository.findByPaperId(p.id());
            summaries.add(new PaperSummaryDto(p, authors, chunks.size(), claims.size()));
        }

        return summaries;
    }

    public PaperDetailDto getPaperDetail(UUID paperId, UUID userId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new IllegalArgumentException("Paper not found with ID: " + paperId));

        validateAccess(paper, userId);

        List<AuthorRecord> authors = authorRepository.findByPaperId(paperId);
        List<DocumentChunk> chunks = chunkRepository.findByPaperId(paperId);
        List<Claim> claims = claimRepository.findByPaperId(paperId);
        var concepts = conceptRepository.findByPaperId(paperId);
        var references = referenceRepository.findBySourcePaperId(paperId);

        return new PaperDetailDto(paper, authors, concepts, references, claims, chunks, chunks.size(), claims.size());
    }

    public List<DocumentChunk> getPaperChunks(UUID paperId, UUID userId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new IllegalArgumentException("Paper not found with ID: " + paperId));
        validateAccess(paper, userId);
        return chunkRepository.findByPaperId(paperId);
    }

    public List<Claim> getPaperClaims(UUID paperId, UUID userId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new IllegalArgumentException("Paper not found with ID: " + paperId));
        validateAccess(paper, userId);
        return claimRepository.findByPaperId(paperId);
    }

    public Optional<IngestionJob> getIngestionStatus(UUID paperId, UUID userId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new IllegalArgumentException("Paper not found with ID: " + paperId));
        validateAccess(paper, userId);
        return jobRepository.findByPaperId(paperId);
    }

    @Transactional
    public void deletePaper(UUID paperId, UUID userId) {
        Paper paper = paperRepository.findById(paperId)
                .orElseThrow(() -> new IllegalArgumentException("Paper not found with ID: " + paperId));
        if (!paper.ownerId().equals(userId)) {
            throw new AccessDeniedException("Only the owner can delete this paper");
        }
        paperRepository.delete(paperId);
    }

    private void validateAccess(Paper paper, UUID userId) {
        if (paper.visibility() == PaperVisibility.PRIVATE && !paper.ownerId().equals(userId)) {
            throw new AccessDeniedException("Access denied to private paper");
        }
    }
}
