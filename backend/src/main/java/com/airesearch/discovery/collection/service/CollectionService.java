package com.airesearch.discovery.collection.service;

import com.airesearch.discovery.collection.dto.CollectionDtos.*;
import com.airesearch.discovery.collection.repository.CollectionRepository;
import com.airesearch.discovery.collection.repository.CollectionRepository.CollectionEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;

    public CollectionService(CollectionRepository collectionRepository) {
        this.collectionRepository = collectionRepository;
    }

    @Transactional
    public CollectionDetailDto createCollection(CreateCollectionRequest request, UUID userId) {
        CollectionEntity entity = new CollectionEntity(
                UUID.randomUUID(),
                userId,
                request.name(),
                request.description(),
                Instant.now(),
                Instant.now()
        );
        CollectionEntity saved = collectionRepository.save(entity);
        return new CollectionDetailDto(saved.id(), saved.ownerId(), saved.name(), saved.description(), saved.createdAt(), saved.updatedAt(), 0, Collections.emptyList());
    }

    public List<CollectionDetailDto> listCollections(UUID userId) {
        List<CollectionEntity> entities = collectionRepository.findByOwner(userId);
        List<CollectionDetailDto> dtos = new ArrayList<>();
        for (var e : entities) {
            List<UUID> paperIds = collectionRepository.findPaperIds(e.id());
            dtos.add(new CollectionDetailDto(e.id(), e.ownerId(), e.name(), e.description(), e.createdAt(), e.updatedAt(), paperIds.size(), paperIds));
        }
        return dtos;
    }

    public CollectionDetailDto getCollectionDetail(UUID id, UUID userId) {
        CollectionEntity entity = collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found"));
        validateOwnership(entity, userId);
        List<UUID> paperIds = collectionRepository.findPaperIds(id);
        return new CollectionDetailDto(entity.id(), entity.ownerId(), entity.name(), entity.description(), entity.createdAt(), entity.updatedAt(), paperIds.size(), paperIds);
    }

    @Transactional
    public CollectionDetailDto updateCollection(UUID id, UpdateCollectionRequest request, UUID userId) {
        CollectionEntity entity = collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found"));
        validateOwnership(entity, userId);
        String name = request.name() != null ? request.name() : entity.name();
        String desc = request.description() != null ? request.description() : entity.description();
        collectionRepository.update(id, name, desc);
        return getCollectionDetail(id, userId);
    }

    @Transactional
    public void deleteCollection(UUID id, UUID userId) {
        CollectionEntity entity = collectionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found"));
        validateOwnership(entity, userId);
        collectionRepository.delete(id);
    }

    @Transactional
    public void addPaper(UUID collectionId, UUID paperId, UUID userId) {
        CollectionEntity entity = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found"));
        validateOwnership(entity, userId);
        collectionRepository.addPaper(collectionId, paperId);
    }

    @Transactional
    public void removePaper(UUID collectionId, UUID paperId, UUID userId) {
        CollectionEntity entity = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new IllegalArgumentException("Collection not found"));
        validateOwnership(entity, userId);
        collectionRepository.removePaper(collectionId, paperId);
    }

    private void validateOwnership(CollectionEntity entity, UUID userId) {
        if (!entity.ownerId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to modify this collection");
        }
    }
}
