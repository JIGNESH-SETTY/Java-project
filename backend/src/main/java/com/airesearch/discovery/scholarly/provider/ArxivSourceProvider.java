package com.airesearch.discovery.scholarly.provider;

import com.airesearch.discovery.scholarly.dto.SourceSearchOptions;
import com.airesearch.discovery.scholarly.dto.SourceSearchResult;
import com.airesearch.discovery.scholarly.model.OpenAccessDocument;
import com.airesearch.discovery.scholarly.model.PaperMetadata;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Component
public class ArxivSourceProvider implements ScholarlySourceProvider {

    private static final Logger log = LoggerFactory.getLogger(ArxivSourceProvider.class);
    private final RestClient restClient;

    public ArxivSourceProvider() {
        this.restClient = RestClient.builder()
                .baseUrl("http://export.arxiv.org/api")
                .defaultHeader("User-Agent", "AIResearchDiscoveryEngine/1.0")
                .build();
    }

    @Override
    public String getProviderName() {
        return "arXiv";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public SourceSearchResult search(String query, SourceSearchOptions options) {
        int limit = options != null && options.limit() > 0 ? Math.min(options.limit(), 25) : 10;
        try {
            String encoded = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "/query?search_query=all:" + encoded + "&start=0&max_results=" + limit;

            String xml = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            if (xml == null || xml.isBlank()) {
                return new SourceSearchResult(getProviderName(), query, 0, List.of());
            }

            List<PaperMetadata> papers = parseArxivXml(xml);
            return new SourceSearchResult(getProviderName(), query, papers.size(), papers);
        } catch (Exception e) {
            log.warn("arXiv search failed for query [{}]: {}", query, e.getMessage());
            return new SourceSearchResult(getProviderName(), query, 0, List.of());
        }
    }

    @Override
    public PaperMetadata resolveByDoi(String doi) {
        // Search arXiv by DOI if present
        try {
            String encoded = URLEncoder.encode("doi:" + doi, StandardCharsets.UTF_8);
            String url = "/query?search_query=" + encoded + "&max_results=1";
            String xml = restClient.get().uri(url).retrieve().body(String.class);
            List<PaperMetadata> list = parseArxivXml(xml);
            return list.isEmpty() ? null : list.get(0);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public PaperMetadata resolveByExternalId(String externalId) {
        if (externalId == null || externalId.isBlank()) return null;
        try {
            String cleanId = externalId.replace("arxiv:", "").replace("arXiv:", "").trim();
            String url = "/query?id_list=" + cleanId;
            String xml = restClient.get().uri(url).retrieve().body(String.class);
            List<PaperMetadata> list = parseArxivXml(xml);
            return list.isEmpty() ? null : list.get(0);
        } catch (Exception e) {
            log.warn("arXiv resolve ID failed for [{}]: {}", externalId, e.getMessage());
            return null;
        }
    }

    @Override
    public Optional<OpenAccessDocument> findOpenAccessPdf(PaperMetadata metadata) {
        if (metadata == null || metadata.openAccessPdfUrl() == null || metadata.openAccessPdfUrl().isBlank()) {
            return Optional.empty();
        }
        try {
            RestClient downloadClient = RestClient.builder().build();
            byte[] bytes = downloadClient.get()
                    .uri(metadata.openAccessPdfUrl())
                    .retrieve()
                    .body(byte[].class);

            if (bytes != null && bytes.length > 1000) {
                return Optional.of(new OpenAccessDocument(
                        metadata.openAccessPdfUrl(),
                        "application/pdf",
                        "arXiv.org Perpetual Non-Exclusive License",
                        getProviderName(),
                        bytes
                ));
            }
        } catch (Exception e) {
            log.warn("Failed to download legal arXiv PDF from [{}]: {}", metadata.openAccessPdfUrl(), e.getMessage());
        }
        return Optional.empty();
    }

    private List<PaperMetadata> parseArxivXml(String xml) {
        List<PaperMetadata> results = new ArrayList<>();
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new InputSource(new StringReader(xml)));

            NodeList entries = doc.getElementsByTagName("entry");
            for (int i = 0; i < entries.getLength(); i++) {
                Element entry = (Element) entries.item(i);
                PaperMetadata meta = mapEntry(entry);
                if (meta != null) results.add(meta);
            }
        } catch (Exception e) {
            log.warn("Failed to parse arXiv Atom XML: {}", e.getMessage());
        }
        return results;
    }

    private PaperMetadata mapEntry(Element entry) {
        String idUrl = getText(entry, "id");
        String title = getText(entry, "title").replaceAll("\\s+", " ").trim();
        String summary = getText(entry, "summary").replaceAll("\\s+", " ").trim();
        String published = getText(entry, "published");

        Integer year = null;
        if (published != null && published.length() >= 4) {
            try {
                year = Integer.parseInt(published.substring(0, 4));
            } catch (Exception ignored) {}
        }

        List<String> authors = new ArrayList<>();
        NodeList authorNodes = entry.getElementsByTagName("author");
        for (int i = 0; i < authorNodes.getLength(); i++) {
            Element author = (Element) authorNodes.item(i);
            String name = getText(author, "name");
            if (!name.isBlank()) authors.add(name);
        }

        String arxivId = idUrl;
        if (idUrl.contains("/abs/")) {
            arxivId = idUrl.substring(idUrl.lastIndexOf("/abs/") + 5);
        }

        String pdfUrl = "https://arxiv.org/pdf/" + arxivId + ".pdf";

        String doi = null;
        NodeList doiNodes = entry.getElementsByTagName("arxiv:doi");
        if (doiNodes.getLength() == 0) {
            doiNodes = entry.getElementsByTagNameNS("http://arxiv.org/schemas/atom", "doi");
        }
        if (doiNodes.getLength() > 0) {
            doi = doiNodes.item(0).getTextContent().trim();
        }

        Map<String, String> externalIds = new HashMap<>();
        externalIds.put("arXiv", arxivId);
        if (doi != null) externalIds.put("DOI", doi);

        return new PaperMetadata(
                title,
                authors,
                summary,
                doi,
                year,
                "arXiv Preprint (" + arxivId + ")",
                getProviderName(),
                arxivId,
                idUrl,
                externalIds,
                pdfUrl,
                "OPEN_ACCESS",
                "arXiv Open Access License",
                0,
                "Metadata & Open-Access PDF directly from arXiv official API"
        );
    }

    private String getText(Element parent, String tagName) {
        NodeList nodes = parent.getElementsByTagName(tagName);
        if (nodes.getLength() > 0) {
            return nodes.item(0).getTextContent().trim();
        }
        return "";
    }
}
