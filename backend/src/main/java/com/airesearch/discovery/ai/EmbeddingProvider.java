package com.airesearch.discovery.ai;

import java.util.List;

/**
 * Pluggable interface for vector embedding generation.
 */
public interface EmbeddingProvider {

    /**
     * Generate a normalized embedding vector for the given input text.
     */
    float[] embed(String text);

    /**
     * Generate normalized embeddings for a batch of texts.
     */
    List<float[]> embedBatch(List<String> texts);

    /**
     * Dimensionality of the vectors produced by this model (e.g. 384 for all-MiniLM-L6-v2).
     */
    int getDimension();

    /**
     * Name or identifier of the embedding model.
     */
    String getModelName();
}
