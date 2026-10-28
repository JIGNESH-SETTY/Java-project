package com.airesearch.discovery.paper.dto;

import com.airesearch.discovery.shared.enums.PaperVisibility;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ManualPaperRequest(
    @NotBlank(message = "Title is required")
    String title,
    String abstractText,
    String doi,
    Integer publicationYear,
    String venue,
    List<String> authors,
    PaperVisibility visibility
) {}
