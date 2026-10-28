package com.airesearch.discovery.scholarly.model;

public record OpenAccessDocument(
    String url,
    String contentType,
    String licenseName,
    String sourceProvider,
    byte[] content
) {}
