package com.airesearch.discovery.scholarly.dto;

public record SourceSearchOptions(
    int limit,
    Integer yearFrom,
    Integer yearTo,
    boolean openAccessOnly
) {
    public static SourceSearchOptions defaultOptions() {
        return new SourceSearchOptions(10, null, null, false);
    }
}
