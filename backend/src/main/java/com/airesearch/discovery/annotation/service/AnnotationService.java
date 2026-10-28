package com.airesearch.discovery.annotation.service;

import com.airesearch.discovery.annotation.dto.AnnotationDtos.*;
import com.airesearch.discovery.annotation.repository.AnnotationRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AnnotationService {

    private final AnnotationRepository annotationRepository;

    public AnnotationService(AnnotationRepository annotationRepository) {
        this.annotationRepository = annotationRepository;
    }

    @Transactional
    public AnnotationDto createAnnotation(CreateAnnotationRequest request, UUID userId) {
        AnnotationDto dto = new AnnotationDto(
                UUID.randomUUID(),
                userId,
                request.paperId(),
                request.chunkId(),
                request.claimId(),
                request.body(),
                request.annotationType() != null ? request.annotationType() : "NOTE",
                Instant.now(),
                Instant.now()
        );
        return annotationRepository.save(dto);
    }

    public List<AnnotationDto> listAnnotations(UUID paperId, UUID claimId, UUID userId) {
        if (paperId != null) {
            return annotationRepository.findByPaper(paperId);
        } else if (claimId != null) {
            return annotationRepository.findByClaim(claimId);
        } else {
            return annotationRepository.findByUser(userId);
        }
    }

    @Transactional
    public AnnotationDto updateAnnotation(UUID id, UpdateAnnotationRequest request, UUID userId) {
        AnnotationDto existing = annotationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Annotation not found"));
        if (!existing.userId().equals(userId)) {
            throw new AccessDeniedException("You can only modify your own annotations");
        }
        annotationRepository.update(id, request.body());
        return new AnnotationDto(existing.id(), existing.userId(), existing.paperId(), existing.chunkId(),
                existing.claimId(), request.body(), existing.annotationType(), existing.createdAt(), Instant.now());
    }

    @Transactional
    public void deleteAnnotation(UUID id, UUID userId) {
        AnnotationDto existing = annotationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Annotation not found"));
        if (!existing.userId().equals(userId)) {
            throw new AccessDeniedException("You can only delete your own annotations");
        }
        annotationRepository.delete(id);
    }
}
