package com.airesearch.discovery.scholarly.service;

import com.airesearch.discovery.ingestion.model.IngestionJob;
import com.airesearch.discovery.shared.enums.JobStatus;
import com.airesearch.discovery.ingestion.repository.IngestionJobRepository;
import com.airesearch.discovery.ingestion.service.IngestionService;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository;
import com.airesearch.discovery.paper.repository.PaperRepository;
import com.airesearch.discovery.scholarly.dto.ScholarlyImportRequest;
import com.airesearch.discovery.scholarly.dto.ScholarlyImportResult;
import com.airesearch.discovery.scholarly.dto.SourceSearchOptions;
import com.airesearch.discovery.scholarly.dto.SourceSearchResult;
import com.airesearch.discovery.scholarly.model.OpenAccessDocument;
import com.airesearch.discovery.scholarly.model.PaperAccessLink;
import com.airesearch.discovery.scholarly.model.PaperExternalIdentifier;
import com.airesearch.discovery.scholarly.model.PaperMetadata;
import com.airesearch.discovery.scholarly.provider.ScholarlySourceProvider;
import com.airesearch.discovery.scholarly.repository.ScholarlyRepository;
import com.airesearch.discovery.shared.enums.PaperVisibility;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;

@Service
public class ScholarlyService {

    private static final Logger log = LoggerFactory.getLogger(ScholarlyService.class);

    private final List<ScholarlySourceProvider> providers;
    private final PaperRepository paperRepository;
    private final AuthorRepository authorRepository;
    private final ScholarlyRepository scholarlyRepository;
    private final IngestionService ingestionService;
    private final IngestionJobRepository jobRepository;
    private final Path uploadDir;

    public ScholarlyService(
            List<ScholarlySourceProvider> providers,
            PaperRepository paperRepository,
            AuthorRepository authorRepository,
            ScholarlyRepository scholarlyRepository,
            IngestionService ingestionService,
            IngestionJobRepository jobRepository,
            @Value("${app.upload.dir:./uploads/papers}") String uploadDirPath) {
        this.providers = providers;
        this.paperRepository = paperRepository;
        this.authorRepository = authorRepository;
        this.scholarlyRepository = scholarlyRepository;
        this.ingestionService = ingestionService;
        this.jobRepository = jobRepository;
        this.uploadDir = Paths.get(uploadDirPath);
        try {
            Files.createDirectories(uploadDir);
        } catch (Exception e) {
            log.warn("Could not create upload directory for scholarly imports: {}", e.getMessage());
        }
    }

    public List<String> getAvailableProviders() {
        return providers.stream().map(ScholarlySourceProvider::getProviderName).toList();
    }

    public List<SourceSearchResult> searchAll(String query, String providerFilter, SourceSearchOptions options) {
        List<SourceSearchResult> results = new ArrayList<>();
        for (ScholarlySourceProvider provider : providers) {
            if (providerFilter != null && !providerFilter.isBlank() && !providerFilter.equalsIgnoreCase("ALL")) {
                if (!provider.getProviderName().equalsIgnoreCase(providerFilter)) {
                    continue;
                }
            }
            try {
                SourceSearchResult res = provider.search(query, options);
                if (res != null && !res.papers().isEmpty()) {
                    results.add(res);
                }
            } catch (Exception e) {
                log.warn("Search error on provider {}: {}", provider.getProviderName(), e.getMessage());
            }
        }
        return results;
    }

    public PaperMetadata resolveDoi(String doi) {
        if (doi == null || doi.isBlank()) return null;
        for (ScholarlySourceProvider provider : providers) {
            try {
                PaperMetadata meta = provider.resolveByDoi(doi);
                if (meta != null && meta.title() != null && !meta.title().isBlank()) {
                    return meta;
                }
            } catch (Exception e) {
                log.debug("DOI resolution error on provider {}: {}", provider.getProviderName(), e.getMessage());
            }
        }
        return null;
    }

    public PaperMetadata resolveExternal(String providerName, String externalId) {
        for (ScholarlySourceProvider provider : providers) {
            if (provider.getProviderName().equalsIgnoreCase(providerName)) {
                return provider.resolveByExternalId(externalId);
            }
        }
        return null;
    }

    @Transactional
    public ScholarlyImportResult importPaper(ScholarlyImportRequest request, UUID userId) {
        PaperMetadata meta = request.metadata();
        if (meta == null || meta.title() == null || meta.title().isBlank()) {
            throw new IllegalArgumentException("Cannot import paper with empty title or metadata");
        }

        UUID paperId = UUID.randomUUID();
        String title = meta.title().trim();
        String abstractText = meta.abstractText() != null ? meta.abstractText() : "Abstract not provided by official metadata feed.";
        Integer year = meta.publicationYear() != null ? meta.publicationYear() : Calendar.getInstance().get(Calendar.YEAR);
        String venue = meta.venue() != null && !meta.venue().isBlank() ? meta.venue() : meta.provider();
        String doi = meta.doi();

        // 1. Persist paper entity
        Paper paper = new Paper(
                paperId,
                userId,
                title,
                abstractText,
                doi,
                year,
                venue,
                null,
                "METADATA_ONLY",
                null,
                PaperVisibility.PRIVATE,
                Instant.now(),
                Instant.now()
        );
        paperRepository.save(paper);

        // 2. Persist authors
        if (meta.authors() != null) {
            int order = 0;
            for (String authorName : meta.authors()) {
                if (authorName != null && !authorName.isBlank()) {
                    var authorRecord = authorRepository.findOrCreate(authorName, null);
                    authorRepository.linkPaperAuthor(paperId, authorRecord.id(), order++);
                }
            }
        }

        // 3. Persist external identifiers
        String primaryProvider = meta.provider() != null ? meta.provider() : "External";
        scholarlyRepository.saveExternalIdentifier(new PaperExternalIdentifier(
                UUID.randomUUID(),
                paperId,
                primaryProvider,
                meta.externalId() != null ? meta.externalId() : (doi != null ? doi : paperId.toString()),
                meta.externalUrl(),
                doi,
                meta.metadataSource() != null ? meta.metadataSource() : "Official API import",
                Instant.now()
        ));

        if (meta.externalIds() != null) {
            for (var entry : meta.externalIds().entrySet()) {
                if (!entry.getKey().equalsIgnoreCase(primaryProvider)) {
                    scholarlyRepository.saveExternalIdentifier(new PaperExternalIdentifier(
                            UUID.randomUUID(),
                            paperId,
                            entry.getKey(),
                            entry.getValue(),
                            null,
                            doi,
                            "External cross-reference ID",
                            Instant.now()
                    ));
                }
            }
        }

        // 4. Persist access links
        String accessStatus = meta.accessStatus() != null ? meta.accessStatus() : "UNKNOWN";
        if (meta.openAccessPdfUrl() != null && !meta.openAccessPdfUrl().isBlank()) {
            scholarlyRepository.saveAccessLink(new PaperAccessLink(
                    UUID.randomUUID(),
                    paperId,
                    meta.openAccessPdfUrl(),
                    "PDF",
                    accessStatus,
                    meta.licenseName(),
                    primaryProvider,
                    Instant.now()
            ));
        }

        // 5. Open-access full text check & legal ingestion
        boolean attemptedDownload = false;
        String documentPath = null;
        String processingStatus = "METADATA_ONLY";
        String message = "Canonical metadata imported successfully from " + primaryProvider + ".";

        if (request.downloadOpenAccessPdfIfAvailable() && meta.hasOpenAccessPdf()) {
            attemptedDownload = true;
            Optional<OpenAccessDocument> oaDoc = Optional.empty();
            // Try provider that sourced the paper
            for (ScholarlySourceProvider p : providers) {
                if (p.getProviderName().equalsIgnoreCase(primaryProvider)) {
                    oaDoc = p.findOpenAccessPdf(meta);
                    break;
                }
            }
            if (oaDoc.isEmpty()) {
                for (ScholarlySourceProvider p : providers) {
                    oaDoc = p.findOpenAccessPdf(meta);
                    if (oaDoc.isPresent()) break;
                }
            }

            if (oaDoc.isPresent() && oaDoc.get().content() != null && oaDoc.get().content().length > 1000) {
                try {
                    String safeName = paperId + "_" + title.replaceAll("[^a-zA-Z0-9.-]", "_") + ".pdf";
                    if (safeName.length() > 80) safeName = paperId + ".pdf";
                    Path targetFile = uploadDir.resolve(safeName);

                    try (FileOutputStream fos = new FileOutputStream(targetFile.toFile())) {
                        fos.write(oaDoc.get().content());
                    }

                    documentPath = targetFile.toString();
                    processingStatus = "COMPLETED";

                    // Update paper path and status
                    Paper updatedPaper = new Paper(
                            paperId,
                            userId,
                            title,
                            abstractText,
                            doi,
                            year,
                            venue,
                            documentPath,
                            "INGESTING",
                            null,
                            PaperVisibility.PRIVATE,
                            paper.createdAt(),
                            Instant.now()
                    );
                    paperRepository.update(updatedPaper);

                    // Create Ingestion Job and process
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
                    ingestionService.processDocument(updatedPaper, savedJob, targetFile.toFile(), safeName);

                    processingStatus = paperRepository.findById(paperId).map(Paper::processingStatus).orElse("COMPLETED");
                    message = "Legal open-access document (" + oaDoc.get().licenseName() + ") verified and ingested into semantic evidence engine.";
                } catch (Exception e) {
                    log.error("Failed to process downloaded open access document: {}", e.getMessage(), e);
                    message = "Metadata imported. Open-access PDF download encountered an issue: " + e.getMessage() + ". You can upload an authorized copy manually.";
                }
            } else {
                message = "Canonical metadata imported. An open-access link was listed, but automatic full-text retrieval was restricted by the host. You can upload an authorized PDF file manually.";
            }
        } else {
            message = "Canonical metadata imported. No open-access PDF was legally downloadable from official sources. You can upload an authorized PDF file manually.";
        }

        String attribution = meta.metadataSource() != null ? meta.metadataSource() : ("Metadata from " + primaryProvider + " official API");

        return new ScholarlyImportResult(
                paperId,
                title,
                doi,
                processingStatus,
                accessStatus,
                documentPath,
                attribution,
                message
        );
    }

    public List<PaperExternalIdentifier> getExternalIdentifiers(UUID paperId) {
        return scholarlyRepository.findExternalIdentifiersByPaperId(paperId);
    }

    public List<PaperAccessLink> getAccessLinks(UUID paperId) {
        return scholarlyRepository.findAccessLinksByPaperId(paperId);
    }
}
