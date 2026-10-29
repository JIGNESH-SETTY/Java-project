package com.airesearch.discovery.ai.provider;

import com.airesearch.discovery.ai.ChatModelProvider;
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
 * Anthropic Claude API provider adapter for chat and reasoning.
 */
@Component("anthropicAiProvider")
public class AnthropicAiProvider implements ChatModelProvider {

    private static final Logger log = LoggerFactory.getLogger(AnthropicAiProvider.class);

    private final String apiKey;
    private final String baseUrl;
    private final String chatModel;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AnthropicAiProvider(
            @Value("${app.ai.anthropic.api-key:}") String apiKey,
            @Value("${app.ai.anthropic.base-url:https://api.anthropic.com/v1}") String baseUrl,
            @Value("${app.ai.anthropic.chat-model:claude-3-5-haiku-20241022}") String chatModel,
            RestTemplateBuilder restTemplateBuilder,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.chatModel = chatModel;
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
    public String getModelName() {
        return chatModel;
    }

    @Override
    public String generate(String prompt, String systemPrompt) {
        if (!isConfigured()) {
            log.warn("Anthropic API key is missing. Cannot generate response.");
            return "Anthropic API key is not configured in .env (ANTHROPIC_API_KEY).";
        }

        String url = baseUrl + "/messages";
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", chatModel);
            body.put("max_tokens", 4096);

            if (systemPrompt != null && !systemPrompt.isBlank()) {
                body.put("system", systemPrompt);
            }

            List<Map<String, String>> messages = List.of(
                    Map.of("role", "user", "content", prompt)
            );
            body.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-api-key", apiKey);
            headers.set("anthropic-version", "2023-06-01");
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<JsonNode> response = restTemplate.postForEntity(url, request, JsonNode.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode contentArray = response.getBody().path("content");
                if (contentArray.isArray() && !contentArray.isEmpty()) {
                    return contentArray.get(0).path("text").asText("");
                }
            }
        } catch (Exception e) {
            log.error("Anthropic message generation failed: {}", e.getMessage());
        }
        return "Failed to generate AI response from Anthropic Claude.";
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
            log.error("Failed to parse Anthropic structured response for {}: {}", responseType.getSimpleName(), e.getMessage());
            return Optional.empty();
        }
    }
}

