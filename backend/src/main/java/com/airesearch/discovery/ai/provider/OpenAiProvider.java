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
 * OpenAI / OpenAI-compatible API provider adapter for embeddings and chat generation.
 */
@Component("openAiProvider")
public class OpenAiProvider implements EmbeddingProvider, ChatModelProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiProvider.class);

    private final String apiKey;
    private final String baseUrl;
    private final String chatModel;
    private final String embeddingModel;
    private final int dimension;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiProvider(
            @Value("${app.ai.openai.api-key:}") String apiKey,
            @Value("${app.ai.openai.base-url:https://api.openai.com/v1}") String baseUrl,
            @Value("${app.ai.openai.chat-model:gpt-4o-mini}") String chatModel,
            @Value("${app.ai.openai.embedding-model:text-embedding-3-small}") String embeddingModel,
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
            log.warn("OpenAI API key is missing. Returning zero vector.");
            return new float[dimension];
        }

        String url = baseUrl + "/embeddings";
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", embeddingModel);
            body.put("input", text);
            body.put("dimensions", dimension);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode dataNode = response.getBody().path("data");
                if (dataNode.isArray() && !dataNode.isEmpty()) {
                    JsonNode embNode = dataNode.get(0).path("embedding");
                    if (embNode.isArray()) {
                        float[] vector = new float[dimension];
                        int copyLen = Math.min(embNode.size(), dimension);
                        for (int i = 0; i < copyLen; i++) {
                            vector[i] = (float) embNode.get(i).asDouble();
                        }
                        return vector;
                    }
                }
            }
        } catch (Exception e) {
            log.error("OpenAI embedding failed: {}", e.getMessage());
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
            log.warn("OpenAI API key is missing. Cannot generate response.");
            return "OpenAI API key is not configured in .env (OPENAI_API_KEY).";
        }

        String url = baseUrl + "/chat/completions";
        try {
            List<Map<String, String>> messages = new ArrayList<>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                messages.add(Map.of("role", "system", "content", systemPrompt));
            }
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> body = new HashMap<>();
            body.put("model", chatModel);
            body.put("messages", messages);
            body.put("temperature", 0.2);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode choices = response.getBody().path("choices");
                if (choices.isArray() && !choices.isEmpty()) {
                    return choices.get(0).path("message").path("content").asText("");
                }
            }
        } catch (Exception e) {
            log.error("OpenAI chat completion failed: {}", e.getMessage());
        }
        return "Failed to generate AI response from OpenAI.";
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
            log.error("Failed to parse OpenAI structured response for {}: {}", responseType.getSimpleName(), e.getMessage());
            return Optional.empty();
        }
    }
}

