package com.airesearch.discovery.ingestion.parser;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Robust scholarly PDF text and metadata extractor using Apache PDFBox 3.
 */
@Component
public class PdfBoxDocumentParser implements DocumentParser {

    private static final Logger log = LoggerFactory.getLogger(PdfBoxDocumentParser.class);
    private static final Pattern DOI_PATTERN = Pattern.compile("10\\.\\d{4,9}/[-._;()/:A-Za-z0-9]+");

    @Override
    public boolean supports(String mimeType) {
        return "application/pdf".equalsIgnoreCase(mimeType);
    }

    @Override
    public ParsedDocument parse(InputStream inputStream, String filename) {
        List<ParsedPage> pages = new ArrayList<>();
        String extractedTitle = null;
        String extractedAbstract = null;
        String extractedDoi = null;
        Integer extractedYear = null;
        List<String> authors = new ArrayList<>();
        List<String> rawReferences = new ArrayList<>();
        Map<String, String> metadata = new HashMap<>();

        try {
            byte[] bytes = inputStream.readAllBytes();
            try (PDDocument document = Loader.loadPDF(bytes)) {
                int totalPages = document.getNumberOfPages();
                PDFTextStripper stripper = new PDFTextStripper();

                StringBuilder allText = new StringBuilder();

                for (int p = 1; p <= totalPages; p++) {
                    stripper.setStartPage(p);
                    stripper.setEndPage(p);
                    String pageText = stripper.getText(document);
                    pages.add(new ParsedPage(p, pageText));
                    allText.append(pageText).append("\n\n");
                }

                // Metadata extraction heuristics
                if (!pages.isEmpty()) {
                    String firstPage = pages.get(0).text();
                    extractedTitle = extractTitle(firstPage, filename);
                    extractedAbstract = extractAbstract(firstPage);
                    extractedDoi = extractDoi(allText.toString());
                    extractedYear = extractYear(allText.toString());
                    authors = extractAuthors(firstPage);
                }

                rawReferences = extractReferences(allText.toString());
                metadata.put("totalPages", String.valueOf(totalPages));
                metadata.put("extractor", "Apache PDFBox 3.0");
            }
        } catch (Exception e) {
            log.error("Failed to parse PDF document: {}", e.getMessage(), e);
            throw new RuntimeException("PDF parsing error: " + e.getMessage(), e);
        }

        return new ParsedDocument(
                extractedTitle != null ? extractedTitle : cleanFilenameToTitle(filename),
                extractedAbstract,
                extractedYear != null ? extractedYear : Calendar.getInstance().get(Calendar.YEAR),
                "Scholarly Publication",
                extractedDoi,
                authors,
                pages,
                rawReferences,
                metadata
        );
    }

    private String extractTitle(String page1Text, String filename) {
        String[] lines = page1Text.split("\\r?\\n");
        StringBuilder titleCandidate = new StringBuilder();

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            if (trimmed.equalsIgnoreCase("abstract") || trimmed.toLowerCase().startsWith("abstract:")) {
                break;
            }
            if (trimmed.length() > 5 && !trimmed.matches("(?i).*proceedings|conference|ieee|acm|arxiv|vol\\..*")) {
                if (titleCandidate.length() > 0) {
                    titleCandidate.append(" ");
                }
                titleCandidate.append(trimmed);
                if (titleCandidate.length() > 120) {
                    break;
                }
            }
        }

        String result = titleCandidate.toString().trim();
        return result.length() > 5 ? result : cleanFilenameToTitle(filename);
    }

    private String extractAbstract(String page1Text) {
        int abstractIdx = page1Text.toLowerCase().indexOf("abstract");
        if (abstractIdx != -1) {
            String afterAbstract = page1Text.substring(abstractIdx + "abstract".length()).trim();
            if (afterAbstract.startsWith(":") || afterAbstract.startsWith("-")) {
                afterAbstract = afterAbstract.substring(1).trim();
            }

            // Stop at Introduction or Index Terms or Keywords
            int endIdx = -1;
            for (String marker : List.of("1. introduction", "1 introduction", "introduction", "keywords", "index terms")) {
                int idx = afterAbstract.toLowerCase().indexOf(marker);
                if (idx != -1 && (endIdx == -1 || idx < endIdx)) {
                    endIdx = idx;
                }
            }

            if (endIdx != -1) {
                return afterAbstract.substring(0, endIdx).trim();
            } else {
                return afterAbstract.length() > 1000 ? afterAbstract.substring(0, 1000).trim() : afterAbstract;
            }
        }
        return null;
    }

    private String extractDoi(String fullText) {
        Matcher matcher = DOI_PATTERN.matcher(fullText);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private Integer extractYear(String fullText) {
        Pattern yearPattern = Pattern.compile("\\b(19\\d{2}|20[0-2]\\d)\\b");
        Matcher matcher = yearPattern.matcher(fullText);
        Integer lastFound = null;
        int count = 0;
        while (matcher.find() && count < 10) {
            int y = Integer.parseInt(matcher.group());
            if (y >= 1970 && y <= Calendar.getInstance().get(Calendar.YEAR)) {
                lastFound = y;
            }
            count++;
        }
        return lastFound;
    }

    private List<String> extractAuthors(String page1Text) {
        List<String> authors = new ArrayList<>();
        String[] lines = page1Text.split("\\r?\\n");
        for (int i = 0; i < Math.min(lines.length, 12); i++) {
            String line = lines[i].trim();
            if (line.toLowerCase().contains("abstract")) break;
            if (line.matches(".*[A-Z][a-z]+ [A-Z][a-z]+.*") && !line.matches("(?i).*university|institute|department|school.*")) {
                for (String part : line.split("[,;and&]")) {
                    String author = part.replaceAll("[0-9*†‡]", "").trim();
                    if (author.length() > 3 && author.split(" ").length >= 2 && authors.size() < 6) {
                        authors.add(author);
                    }
                }
            }
        }
        return authors;
    }

    private List<String> extractReferences(String fullText) {
        List<String> refs = new ArrayList<>();
        int refIdx = fullText.toLowerCase().lastIndexOf("references");
        if (refIdx != -1) {
            String refSection = fullText.substring(refIdx + "references".length()).trim();
            String[] rawList = refSection.split("\\[\\d+\\]|\\n\\s*\\d+\\.\\s*");
            for (String raw : rawList) {
                String trimmed = raw.replaceAll("\\s+", " ").trim();
                if (trimmed.length() > 20 && refs.size() < 50) {
                    refs.add(trimmed);
                }
            }
        }
        return refs;
    }

    private String cleanFilenameToTitle(String filename) {
        if (filename == null) return "Untitled Paper";
        String clean = filename.replace(".pdf", "").replace("_", " ").replace("-", " ").trim();
        return clean.isEmpty() ? "Untitled Paper" : clean;
    }
}
