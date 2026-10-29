package com.airesearch.discovery.ai;

import com.airesearch.discovery.ai.provider.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Unified high-level AI facade providing vector embeddings and structured generation
 * across pluggable providers: Mock, Ollama, OpenAI, Google Gemini, and Anthropic.
 */
@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final EmbeddingProvider embeddingProvider;
    private final ChatModelProvider chatModelProvider;
    private final String activeProviderName;

    @Autowired
    public AiService(
            @Value("${app.ai.provider:MOCK}") String configuredProvider,
            MockAiProvider mockAiProvider,
            OllamaAiProvider ollamaAiProvider,
            OpenAiProvider openAiProvider,
            GeminiAiProvider geminiAiProvider,
            AnthropicAiProvider anthropicAiProvider) {

        String provider = configuredProvider != null ? configuredProvider.trim().toUpperCase() : "MOCK";

        switch (provider) {
            case "OPENAI" -> {
                log.info("Configured AI Provider: OPENAI");
                this.chatModelProvider = openAiProvider != null ? openAiProvider : mockAiProvider;
                this.embeddingProvider = openAiProvider != null ? openAiProvider : mockAiProvider;
                this.activeProviderName = openAiProvider != null ? "OpenAI (" + openAiProvider.getModelName() + ")" : "Mock AI Engine";
            }
            case "GEMINI" -> {
                log.info("Configured AI Provider: GEMINI");
                this.chatModelProvider = geminiAiProvider != null ? geminiAiProvider : mockAiProvider;
                this.embeddingProvider = geminiAiProvider != null ? geminiAiProvider : mockAiProvider;
                this.activeProviderName = geminiAiProvider != null ? "Google Gemini (" + geminiAiProvider.getModelName() + ")" : "Mock AI Engine";
            }
            case "ANTHROPIC" -> {
                log.info("Configured AI Provider: ANTHROPIC");
                this.chatModelProvider = anthropicAiProvider != null ? anthropicAiProvider : mockAiProvider;
                // Anthropic does not provide embeddings; pair with configured embedding provider or fallback
                if (geminiAiProvider != null && geminiAiProvider.isConfigured()) {
                    this.embeddingProvider = geminiAiProvider;
                } else if (openAiProvider != null && openAiProvider.isConfigured()) {
                    this.embeddingProvider = openAiProvider;
                } else if (ollamaAiProvider != null) {
                    this.embeddingProvider = ollamaAiProvider;
                } else {
                    this.embeddingProvider = mockAiProvider;
                }
                this.activeProviderName = anthropicAiProvider != null ? "Anthropic Claude (" + anthropicAiProvider.getModelName() + ")" : "Mock AI Engine";
            }
            case "OLLAMA" -> {
                log.info("Configured AI Provider: OLLAMA");
                this.embeddingProvider = ollamaAiProvider != null ? ollamaAiProvider : mockAiProvider;
                this.chatModelProvider = ollamaAiProvider != null ? ollamaAiProvider : mockAiProvider;
                this.activeProviderName = ollamaAiProvider != null ? "Ollama (" + ollamaAiProvider.getModelName() + ")" : "Mock AI Engine";
            }
            default -> {
                log.info("Configured AI Provider: MOCK (Offline deterministic simulation)");
                this.embeddingProvider = mockAiProvider;
                this.chatModelProvider = mockAiProvider;
                this.activeProviderName = "Mock AI Engine";
            }
        }
    }

    /**
     * Overloaded constructor for unit testing without all cloud provider beans.
     */
    public AiService(String configuredProvider, MockAiProvider mockAiProvider, OllamaAiProvider ollamaAiProvider) {
        this(configuredProvider, mockAiProvider, ollamaAiProvider, null, null, null);
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
