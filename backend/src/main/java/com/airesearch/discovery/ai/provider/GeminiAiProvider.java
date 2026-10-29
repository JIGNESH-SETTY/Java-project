package com.airesearch.discovery.ai.provider;

import com.airesearch.discovery.ai.ChatModelProvider;
import com.airesearch.discovery.ai.EmbeddingProvider;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

/**
 * Google Gemini API provider adapter for embeddings and chat generation.
 */
@Component("geminiAiProvider")
public class GeminiAiProvider implements EmbeddingProvider, ChatModelProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiAiProvider.class);

    private final String apiKey;
    private final String baseUrl;
    private final String chatModel;
    private final String embeddingModel;
    private final int dimension;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiAiProvider(
            @Value("${app.ai.gemini.api-key:}") String apiKey,
            @Value("${app.ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            @Value("${app.ai.gemini.chat-model:gemini-1.5-flash}") String chatModel,
            @Value("${app.ai.gemini.embedding-model:text-embedding-004}") String embeddingModel,
            @Value("${app.ai.embedding.dimension:384}") int dimension,
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.dimension = dimension;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(90))
                .build();
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    @Override
    public float[] embed(String text) {
        if (!isConfigured()) {
            log.warn("Gemini API key is missing. Returning zero vector.");
            return new float[dimension];
        }

        String modelName = embeddingModel.startsWith("models/") ? embeddingModel : "models/" + embeddingModel;
        String url = baseUrl + "/" + modelName + ":embedContent?key=" + apiKey;

        try {
            Map<String, Object> part = Map.of("text", text);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> body = new HashMap<>();
            body.put("model", modelName);
            body.put("content", content);
            body.put("outputDimensionality", dimension);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode valuesNode = response.getBody().path("embedding").path("values");
                if (valuesNode.isArray() && !valuesNode.isEmpty()) {
                    float[] vector = new float[dimension];
                    int copyLen = Math.min(valuesNode.size(), dimension);
                    for (int i = 0; i < copyLen; i++) {
                        vector[i] = (float) valuesNode.get(i).asDouble();
                    }
                    return vector;
                }
            }
        } catch (Exception e) {
            log.error("Gemini embedding failed: {}", e.getMessage());
        }
        return new float[dimension];
    }

    @Override
    public List<float[]> embedBatch(List<String> texts) {
        List<float[]> results = new ArrayList<>(texts.size());
        for (String text : texts) {
            results.add(embed(text));
        }
        return results;
    }

    @Override
    public int getDimension() {
        return dimension;
    }

    @Override
    public String getModelName() {
        return embeddingModel;
    }

    @Override
    public String generate(String prompt, String systemPrompt) {
        if (!isConfigured()) {
            log.warn("Gemini API key is missing. Cannot generate response.");
            return "Google Gemini API key is not configured in .env (GEMINI_API_KEY).";
        }

        String modelName = chatModel.startsWith("models/") ? chatModel : "models/" + chatModel;
        String url = baseUrl + "/" + modelName + ":generateContent?key=" + apiKey;

        try {
            Map<String, Object> body = new HashMap<>();

            // User prompt contents
            Map<String, Object> userPart = Map.of("text", prompt);
            Map<String, Object> userContent = Map.of("role", "user", "parts", List.of(userPart));
            body.put("contents", List.of(userContent));

            // System instruction if provided
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                Map<String, Object> systemPart = Map.of("text", systemPrompt);
                Map<String, Object> systemContent = Map.of("parts", List.of(systemPart));
                body.put("systemInstruction", systemContent);
            }

            body.put("generationConfig", Map.of("temperature", 0.2));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode candidates = response.getBody().path("candidates");
                if (candidates.isArray() && !candidates.isEmpty()) {
                    JsonNode parts = candidates.get(0).path("content").path("parts");
                    if (parts.isArray() && !parts.isEmpty()) {
                        return parts.get(0).path("text").asText("");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Gemini content generation failed: {}", e.getMessage());
        }
        return "Failed to generate AI response from Google Gemini.";
    }

    @Override
    public <T> Optional<T> generateStructured(String prompt, String systemPrompt, Class<T> responseType) {
        String structuredSystemPrompt = (systemPrompt != null ? systemPrompt : "") +
                "\nYou MUST respond with strictly valid JSON adhering to the target schema. Do not output markdown code blocks or text outside JSON.";

        String rawResponse = generate(prompt, structuredSystemPrompt);
        try {
            String cleanJson = rawResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            } else if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            T result = objectMapper.readValue(cleanJson, responseType);
            return Optional.of(result);
        } catch (Exception e) {
            log.error("Failed to parse Gemini structured response for {}: {}", responseType.getSimpleName(), e.getMessage());
            return Optional.empty();
        }
    }
}

