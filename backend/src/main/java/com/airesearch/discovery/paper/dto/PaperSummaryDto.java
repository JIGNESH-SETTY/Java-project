package com.airesearch.discovery.paper.dto;

import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.AuthorRepository.AuthorRecord;

import java.util.List;

public record PaperSummaryDto(
    Paper paper,
    List<AuthorRecord> authors,
    int chunkCount,
    int claimCount
) {}
