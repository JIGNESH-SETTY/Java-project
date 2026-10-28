package com.airesearch.discovery.comparison.dto;

import com.airesearch.discovery.paper.dto.PaperSummaryDto;
import com.airesearch.discovery.shared.enums.ProvenanceType;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ComparisonRequest(List<UUID> paperIds) {}
