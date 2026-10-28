package com.airesearch.discovery.ingestion.service;

import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.repository.ClaimRelationRepository;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.claims.service.ClaimExtractionService;
import com.airesearch.discovery.ingestion.model.IngestionJob;
import com.airesearch.discovery.ingestion.parser.DocumentParser;
import com.airesearch.discovery.ingestion.parser.DocumentParser.ParsedDocument;
import com.airesearch.discovery.ingestion.repository.IngestionJobRepository;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.*;
import com.airesearch.discovery.paper.repository.AuthorRepository.AuthorRecord;
import com.airesearch.discovery.shared.enums.ConceptType;
import com.airesearch.discovery.shared.enums.JobStatus;
import com.airesearch.discovery.shared.enums.PaperVisibility;
import com.airesearch.discovery.shared.enums.ProvenanceType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.*;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final Path uploadDir;
    private final DocumentParser documentParser;
    private final ChunkingService chunkingService;
    private final PaperRepository paperRepository;
    private final DocumentChunkRepository chunkRepository;
    private final AuthorRepository authorRepository;
    private final ReferenceRepository referenceRepository;
    private final ConceptRepository conceptRepository;
    private final ClaimRepository claimRepository;
    private final ClaimRelationRepository claimRelationRepository;
    private final ClaimExtractionService claimExtractionService;
    private final IngestionJobRepository jobRepository;

    public IngestionService(
            @Value("${app.upload.dir:./uploads/papers}") String uploadDirPath,
            DocumentParser documentParser,
            ChunkingService chunkingService,
            PaperRepository paperRepository,
            DocumentChunkRepository chunkRepository,
            AuthorRepository authorRepository,
            ReferenceRepository referenceRepository,
            ConceptRepository conceptRepository,
            ClaimRepository claimRepository,
            ClaimRelationRepository claimRelationRepository,
            ClaimExtractionService claimExtractionService,
            IngestionJobRepository jobRepository) {

        this.uploadDir = Paths.get(uploadDirPath);
        this.documentParser = documentParser;
        this.chunkingService = chunkingService;
        this.paperRepository = paperRepository;
        this.chunkRepository = chunkRepository;
        this.authorRepository = authorRepository;
        this.referenceRepository = referenceRepository;
        this.conceptRepository = conceptRepository;
        this.claimRepository = claimRepository;
        this.claimRelationRepository = claimRelationRepository;
        this.claimExtractionService = claimExtractionService;
        this.jobRepository = jobRepository;

        try {
            Files.createDirectories(uploadDir);
        } catch (Exception e) {
            log.error("Could not create upload directory", e);
        }
    }

    public record IngestionResponse(Paper paper, IngestionJob job) {}

    @Transactional
    public IngestionResponse startUploadIngestion(MultipartFile file, UUID userId, PaperVisibility visibility) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
        if (!filename.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF documents are supported");
        }

        UUID paperId = UUID.randomUUID();
        String storedFilename = paperId + "_" + filename.replaceAll("[^a-zA-Z0-9.-]", "_");
        Path destination = uploadDir.resolve(storedFilename);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (Exception e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }

        Paper paper = new Paper(
                paperId,
                userId,
                filename.replace(".pdf", ""),
                "Extracting abstract...",
                null,
                Calendar.getInstance().get(Calendar.YEAR),
                "Pending Ingestion",
                destination.toString(),
                "INGESTING",
                null,
                visibility != null ? visibility : PaperVisibility.PRIVATE,
                Instant.now(),
                Instant.now()
        );
        Paper savedPaper = paperRepository.save(paper);

        IngestionJob job = new IngestionJob(
                UUID.randomUUID(),
                paperId,
                JobStatus.PARSING,
                "PARSING_PDF",
                null,
                null,
                Instant.now(),
                null
        );
        IngestionJob savedJob = jobRepository.save(job);

        // Process document (synchronous or async)
        processDocument(savedPaper, savedJob, destination.toFile(), filename);

        return new IngestionResponse(paperRepository.findById(paperId).orElse(savedPaper), jobRepository.findByPaperId(paperId).orElse(savedJob));
    }

    public void processDocument(Paper paper, IngestionJob job, File file, String originalFilename) {
        try {
            log.info("Starting ingestion processing for paper: {}", paper.id());
            jobRepository.update(new IngestionJob(job.id(), paper.id(), JobStatus.PARSING, "PARSING_PDF", null, null, job.startedAt(), null));

            ParsedDocument parsed;
            try (InputStream is = new FileInputStream(file)) {
                parsed = documentParser.parse(is, originalFilename);
            }

            // Update paper metadata
            Paper updatedPaper = new Paper(
                    paper.id(),
                    paper.ownerId(),
                    parsed.title() != null && !parsed.title().isBlank() ? parsed.title() : paper.title(),
                    parsed.abstractText(),
                    parsed.doi(),
                    parsed.publicationYear(),
                    parsed.venue(),
                    paper.documentPath(),
                    "CHUNKING",
                    null,
                    paper.visibility(),
                    paper.createdAt(),
                    Instant.now()
            );
            paperRepository.update(updatedPaper);

            // Authors
            if (parsed.authors() != null) {
                int order = 1;
                for (String authorName : parsed.authors()) {
                    AuthorRecord author = authorRepository.findOrCreate(authorName, null);
                    authorRepository.linkPaperAuthor(paper.id(), author.id(), order++);
                }
            }

            // References
            if (parsed.rawReferences() != null) {
                referenceRepository.saveReferences(paper.id(), parsed.rawReferences());
            }

            // Chunks and batch embeddings
            jobRepository.update(new IngestionJob(job.id(), paper.id(), JobStatus.CHUNKING, "CHUNKING_AND_EMBEDDINGS", null, null, job.startedAt(), null));
            List<ChunkingService.ChunkRecord> chunkRecords = chunkingService.chunkDocument(parsed);

            List<DocumentChunk> domainChunks = new ArrayList<>();
            for (ChunkingService.ChunkRecord r : chunkRecords) {
                domainChunks.add(new DocumentChunk(
                        UUID.randomUUID(),
                        paper.id(),
                        r.chunkIndex(),
                        r.sectionName(),
                        r.pageNumber(),
                        r.charStart(),
                        r.charEnd(),
                        r.content(),
                        r.tokenCount(),
                        r.embedding(),
                        "all-minilm-l6-v2",
                        Instant.now()
                ));
            }
            chunkRepository.saveBatch(domainChunks);

            // Aspect and Claim Extraction
            jobRepository.update(new IngestionJob(job.id(), paper.id(), JobStatus.EXTRACTING_ASPECTS, "EXTRACTING_CLAIMS", null, null, job.startedAt(), null));
            ClaimExtractionService.PaperAspects aspects = claimExtractionService.extractPaperAspects(updatedPaper, domainChunks);

            // Link concepts from aspects
            DocumentChunk firstChunk = domainChunks.isEmpty() ? null : domainChunks.get(0);
            UUID evidenceChunkId = firstChunk != null ? firstChunk.id() : null;

            if (aspects.datasets() != null) {
                for (String d : aspects.datasets()) {
                    var c = conceptRepository.findOrCreate(d, ConceptType.DATASET);
                    conceptRepository.linkPaperConcept(paper.id(), c.id(), "EVALUATES_ON", evidenceChunkId, 0.95, ProvenanceType.REPORTED_IN_PAPER);
                }
            }
            if (aspects.metrics() != null) {
                for (String m : aspects.metrics()) {
                    var c = conceptRepository.findOrCreate(m, ConceptType.METRIC);
                    conceptRepository.linkPaperConcept(paper.id(), c.id(), "REPORTS_METRIC", evidenceChunkId, 0.95, ProvenanceType.REPORTED_IN_PAPER);
                }
            }

            List<Claim> claims = claimExtractionService.extractClaimsFromPaper(updatedPaper, domainChunks);
            for (Claim claim : claims) {
                claimRepository.save(claim);
            }

            // Propose relations
            List<ClaimRelation> relations = claimExtractionService.proposeRelationsForClaims(claims, paper.ownerId());
            for (ClaimRelation r : relations) {
                claimRelationRepository.save(r, r.evidenceChunkIds());
            }

            // Mark completed
            paperRepository.updateProcessingStatus(paper.id(), "COMPLETED", null);
            jobRepository.update(new IngestionJob(job.id(), paper.id(), JobStatus.COMPLETED, "FINISHED", null, null, job.startedAt(), Instant.now()));
            log.info("Successfully completed ingestion for paper: {}", paper.id());

        } catch (Exception e) {
            log.error("Ingestion failed for paper {}: {}", paper.id(), e.getMessage(), e);
            paperRepository.updateProcessingStatus(paper.id(), "FAILED", e.getMessage());
            jobRepository.update(new IngestionJob(job.id(), paper.id(), JobStatus.FAILED, "ERROR", null, e.getMessage(), job.startedAt(), Instant.now()));
        }
    }
}
