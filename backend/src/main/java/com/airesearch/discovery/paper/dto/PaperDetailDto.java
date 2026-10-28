package com.airesearch.discovery.paper.dto;

import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository.AuthorRecord;
import com.airesearch.discovery.paper.repository.ConceptRepository.PaperConceptRecord;
import com.airesearch.discovery.paper.repository.ReferenceRepository.ReferenceRecord;

import java.util.List;

public record PaperDetailDto(
    Paper paper,
    List<AuthorRecord> authors,
    List<PaperConceptRecord> concepts,
    List<ReferenceRecord> references,
    List<Claim> claims,
    List<DocumentChunk> chunks,
    int totalChunks,
    int totalClaims
) {}
