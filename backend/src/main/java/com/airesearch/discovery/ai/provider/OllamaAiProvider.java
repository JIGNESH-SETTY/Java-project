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
 * Ollama AI integration adapter for local model serving.
 */
@Component("ollamaAiProvider")
public class OllamaAiProvider implements EmbeddingProvider, ChatModelProvider {

    private static final Logger log = LoggerFactory.getLogger(OllamaAiProvider.class);

    private final String baseUrl;
    private final String chatModel;
    private final String embeddingModel;
    private final int dimension;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OllamaAiProvider(
            @Value("${app.ai.ollama.base-url:http://localhost:11434}") String baseUrl,
            @Value("${app.ai.ollama.chat-model:llama3.2}") String chatModel,
            @Value("${app.ai.ollama.embedding-model:nomic-embed-text}") String embeddingModel,
            @Value("${app.ai.embedding.dimension:384}") int dimension,
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.chatModel = chatModel;
        this.embeddingModel = embeddingModel;
        this.dimension = dimension;
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(60))
                .build();
    }

    @Override
    public float[] embed(String text) {
        String url = baseUrl + "/api/embeddings";
        try {
            Map<String, Object> body = Map.of(
                    "model", embeddingModel,
                    "prompt", text
            );
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode embeddingNode = response.getBody().get("embedding");
                if (embeddingNode != null && embeddingNode.isArray()) {
                    float[] vector = new float[embeddingNode.size()];
                    for (int i = 0; i < embeddingNode.size(); i++) {
                        vector[i] = (float) embeddingNode.get(i).asDouble();
                    }
                    return vector;
                }
            }
        } catch (Exception e) {
            log.warn("Ollama embedding call failed: {}. Falling back to zero-vector.", e.getMessage());
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
        String url = baseUrl + "/api/chat";
        try {
            List<Map<String, String>> messages = new ArrayList<>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                messages.add(Map.of("role", "system", "content", systemPrompt));
            }
            messages.add(Map.of("role", "user", "content", prompt));

            Map<String, Object> body = Map.of(
                    "model", chatModel,
                    "messages", messages,
                    "stream", false
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode messageNode = response.getBody().path("message").path("content");
                return messageNode.asText("");
            }
        } catch (Exception e) {
            log.warn("Ollama chat generation failed: {}", e.getMessage());
        }
        return "Failed to generate AI response from local Ollama service.";
    }

    @Override
    public <T> Optional<T> generateStructured(String prompt, String systemPrompt, Class<T> responseType) {
        String structuredSystemPrompt = (systemPrompt != null ? systemPrompt : "") +
                "\nYou MUST respond with strictly valid JSON adhering to the target schema. Do not output markdown code blocks or text outside JSON.";

        String rawResponse = generate(prompt, structuredSystemPrompt);
        try {
            // Strip any accidental markdown formatting
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
            log.error("Failed to parse Ollama structured response: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
