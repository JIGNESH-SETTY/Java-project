package com.airesearch.discovery.ingestion.parser;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

public interface DocumentParser {

    ParsedDocument parse(InputStream inputStream, String filename);

    boolean supports(String mimeType);

    record ParsedPage(int pageNumber, String text) {}

    record ParsedDocument(
            String title,
            String abstractText,
            Integer publicationYear,
            String venue,
            String doi,
            List<String> authors,
            List<ParsedPage> pages,
            List<String> rawReferences,
            Map<String, String> metadata
    ) {}
}
