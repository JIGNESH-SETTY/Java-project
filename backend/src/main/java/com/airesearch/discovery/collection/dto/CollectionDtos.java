package com.airesearch.discovery.collection.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class CollectionDtos {

    public record CreateCollectionRequest(
            @NotBlank(message = "Collection name is required")
            String name,
            String description
    ) {}

    public record UpdateCollectionRequest(
            String name,
            String description
    ) {}

    public record CollectionDetailDto(
            UUID id,
            UUID ownerId,
            String name,
            String description,
            Instant createdAt,
            Instant updatedAt,
            int paperCount,
            List<UUID> paperIds
    ) {}
}
