package com.airesearch.discovery.ai;

import com.airesearch.discovery.ai.provider.MockAiProvider;
import com.airesearch.discovery.ai.provider.OllamaAiProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * High-level AI facade providing embeddings and structured generation with graceful fallback.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final EmbeddingProvider embeddingProvider;
    private final ChatModelProvider chatModelProvider;
    private final String activeProviderName;

    public AiService(
            @Value("${app.ai.provider:MOCK}") String configuredProvider,
            MockAiProvider mockAiProvider,
            OllamaAiProvider ollamaAiProvider) {

        if ("OLLAMA".equalsIgnoreCase(configuredProvider)) {
            log.info("Configured AI Provider: OLLAMA");
            this.embeddingProvider = ollamaAiProvider;
            this.chatModelProvider = ollamaAiProvider;
            this.activeProviderName = "Ollama (" + ollamaAiProvider.getModelName() + ")";
        } else {
            log.info("Configured AI Provider: MOCK (Offline, deterministic high-accuracy simulation)");
            this.embeddingProvider = mockAiProvider;
            this.chatModelProvider = mockAiProvider;
            this.activeProviderName = "Mock AI Engine";
        }
    }

    public float[] embed(String text) {
        return embeddingProvider.embed(text);
    }

    public List<float[]> embedBatch(List<String> texts) {
        return embeddingProvider.embedBatch(texts);
    }

    public int getEmbeddingDimension() {
        return embeddingProvider.getDimension();
    }

    public String generate(String prompt, String systemPrompt) {
        return chatModelProvider.generate(prompt, systemPrompt);
    }

    public <T> Optional<T> generateStructured(String prompt, String systemPrompt, Class<T> responseType) {
        return chatModelProvider.generateStructured(prompt, systemPrompt, responseType);
    }

    public String getActiveProviderName() {
        return activeProviderName;
    }
}
