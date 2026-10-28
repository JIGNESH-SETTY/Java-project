package com.airesearch.discovery.ai;

import java.util.Optional;

/**
 * Pluggable interface for LLM completions and structured schema generation.
 */
public interface ChatModelProvider {

    /**
     * Generate raw text response for the given prompt and system instructions.
     */
    String generate(String prompt, String systemPrompt);

    /**
     * Generate structured, validated JSON output mapped directly to a Java DTO.
     */
    <T> Optional<T> generateStructured(String prompt, String systemPrompt, Class<T> responseType);

    /**
     * Model identifier (e.g. llama3.2, gpt-4o-mini, mock-academic-llm).
     */
    String getModelName();
}
