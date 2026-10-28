package com.airesearch.discovery.comparison.dto;

import com.airesearch.discovery.paper.dto.PaperSummaryDto;
import com.airesearch.discovery.shared.enums.ProvenanceType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class ComparisonResponse {

    public record ComparisonCell(
            String content,
            List<UUID> evidenceChunkIds,
            ProvenanceType provenance
    ) {}

    public record ComparisonRow(
            String aspectKey,
            String aspectLabel,
            Map<UUID, ComparisonCell> cells
    ) {}

    public record ComparisonSynthesis(
            String synthesisMarkdown,
            List<String> consensusPoints,
            List<String> divergencePoints,
            List<UUID> evidenceChunkIds
    ) {}

    public record ComparisonResult(
            List<PaperSummaryDto> papers,
            List<ComparisonRow> rows,
            ComparisonSynthesis aiSynthesis
    ) {}
}
