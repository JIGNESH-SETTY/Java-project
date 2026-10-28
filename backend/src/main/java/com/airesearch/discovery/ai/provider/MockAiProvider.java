package com.airesearch.discovery.ai.provider;

import com.airesearch.discovery.ai.ChatModelProvider;
import com.airesearch.discovery.ai.EmbeddingProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;

/**
 * High-fidelity deterministic Mock AI Provider for offline development,
 * student testing, and reproducible local evaluation.
 */
@Component("mockAiProvider")
public class MockAiProvider implements EmbeddingProvider, ChatModelProvider {

    private static final Logger log = LoggerFactory.getLogger(MockAiProvider.class);
    private static final int DIMENSION = 384;
    private final ObjectMapper objectMapper;

    public MockAiProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            return new float[DIMENSION];
        }

        float[] vector = new float[DIMENSION];
        String normalized = text.toLowerCase(Locale.ROOT);
        String[] tokens = normalized.split("\\W+");

        // Hash-based semantic projection with term weighting
        for (String token : tokens) {
            if (token.length() < 2) continue;
            int hash = hashToken(token);
            int index = Math.abs(hash) % DIMENSION;
            float weight = 1.0f + (token.length() > 6 ? 0.5f : 0.0f);
            vector[index] += ((hash & 1) == 0 ? 1.0f : -1.0f) * weight;

            // Secondary projection for subwords/context
            int secondaryIndex = Math.abs(hash * 31) % DIMENSION;
            vector[secondaryIndex] += ((hash & 2) == 0 ? 0.5f : -0.5f) * weight;
        }

        // L2 normalize
        float norm = 0.0f;
        for (float v : vector) {
            norm += v * v;
        }
        norm = (float) Math.sqrt(norm);
        if (norm > 0.00001f) {
            for (int i = 0; i < DIMENSION; i++) {
                vector[i] /= norm;
            }
        }

        return vector;
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
        return DIMENSION;
    }

    @Override
    public String getModelName() {
        return "mock-minilm-l6-v2-384d";
    }

    @Override
    public String generate(String prompt, String systemPrompt) {
        log.info("MockAiProvider: Generating prompt with length {}", prompt.length());
        return "Synthesized academic response based on retrieved research evidence.";
    }

    @Override
    public <T> Optional<T> generateStructured(String prompt, String systemPrompt, Class<T> responseType) {
        log.info("MockAiProvider: Generating structured output for {}", responseType.getSimpleName());
        try {
            // Provide realistic domain mocks based on target class
            String mockJson = getMockJsonForType(responseType.getSimpleName(), prompt);
            if (mockJson != null) {
                T result = objectMapper.readValue(mockJson, responseType);
                return Optional.of(result);
            }
        } catch (Exception e) {
            log.error("Failed to generate mock structured response for {}", responseType.getName(), e);
        }
        return Optional.empty();
    }

    private String getMockJsonForType(String typeName, String prompt) {
        if (typeName.contains("PaperAspects")) {
            return """
            {
              "researchObjective": "Develop an evidence-grounded framework to improve accuracy and reduce hallucinations in retrieval systems.",
              "methodology": "Dual-encoder semantic indexing paired with reciprocal rank fusion and explicit claim tracking.",
              "datasets": ["MS-MARCO", "SciFact", "BioASQ"],
              "metrics": ["NDCG@10", "F1 Score", "Citation Grounding Rate"],
              "majorFindings": "Incorporating claim-level provenance reduces unsupported factual hallucinations by 42% over baseline RAG.",
              "limitations": "Computational overhead during multi-hop graph traversal across large bibliographies.",
              "claimedContributions": [
                "Novel claim-evidence tracking ontology",
                "Hybrid lexical-semantic retrieval fusion benchmarked on scientific text",
                "Automated review drafting with paragraph-to-chunk provenance"
              ]
            }
            """;
        } else if (typeName.contains("ClaimExtraction")) {
            return """
            {
              "claims": [
                {
                  "normalizedText": "Hybrid retrieval combining dense embeddings and BM25 outperforms dense-only retrieval by 6.8% NDCG@10 on scientific literature.",
                  "sourceText": "Our empirical evaluations show that hybrid retrieval combining dense representations with lexical BM25 scores achieves a 6.8% gain in NDCG@10 compared to dense-only retrieval.",
                  "claimType": "FINDING",
                  "confidence": 0.94,
                  "sectionName": "Experiments",
                  "pageNumber": 5,
                  "concepts": ["Hybrid Retrieval", "NDCG@10", "BM25", "Dense Embeddings"]
                },
                {
                  "normalizedText": "Multi-head self-attention eliminates the sequential bottleneck inherent in recurrent architectures.",
                  "sourceText": "The Transformer replaces recurrent neural networks with multi-head self-attention, allowing significant parallelization during training.",
                  "claimType": "METHOD_ASSERTION",
                  "confidence": 0.98,
                  "sectionName": "Introduction",
                  "pageNumber": 1,
                  "concepts": ["Multi-Head Attention", "Transformer", "Recurrent Networks"]
                },
                {
                  "normalizedText": "Performance degrades significantly when key retrieval facts are placed in the middle of long context windows.",
                  "sourceText": "Language model retrieval accuracy drops by up to 23% when pertinent information is located in the middle of the context window rather than at the beginning or end.",
                  "claimType": "LIMITATION",
                  "confidence": 0.92,
                  "sectionName": "Results",
                  "pageNumber": 7,
                  "concepts": ["Lost in the Middle", "Context Window", "Retrieval Accuracy"]
                }
              ]
            }
            """;
        } else if (typeName.contains("ClaimRelation")) {
            return """
            {
              "relations": [
                {
                  "relationType": "QUALIFIES",
                  "confidence": 0.88,
                  "rationale": "Paper B demonstrates that simply increasing context window size suffers from the 'Lost in the Middle' effect, thereby qualifying Paper A's claim that full-context models render external RAG obsolete."
                }
              ]
            }
            """;
        } else if (typeName.contains("ComparisonSynthesis")) {
            return """
            {
              "synthesisMarkdown": "### Methodological Synthesis\\nAcross the evaluated papers, a clear progression is observed from purely parameter-dependent language models toward hybrid and retrieval-augmented systems.\\n\\n**Consensus**: Both Vaswani et al. and Lewis et al. concur that self-attention mechanisms provide superior representation power compared to recurrent topologies.\\n\\n**Divergence**: While early transformer works assumed context scaling was purely bounded by memory, recent investigations (Liu et al.) prove that retrieval position introduces non-uniform attention degradation, necessitating active chunk-level evidence tracking.",
              "consensusPoints": [
                "Self-attention architectures deliver state-of-the-art token representations across NLP benchmarks",
                "Retrieval-augmentation substantially reduces parameter-bound hallucinations"
              ],
              "divergencePoints": [
                "Efficacy of massive context windows vs. fine-grained chunk retrieval",
                "Dense vs. hybrid lexical-semantic indexing under domain shift"
              ],
              "evidenceChunkIds": []
            }
            """;
        } else if (typeName.contains("LiteratureReview")) {
            return """
            {
              "title": "Evidence-Backed Review: Retrieval-Augmented Generation and Context Limitations in Academic NLP",
              "contentMarkdown": "## 1. Introduction\\nRecent advances in natural language processing have increasingly converged on transformer-based architectures capable of processing extensive technical corpora. However, generating factual, evidence-backed summaries without hallucination remains a core challenge in scientific discovery [[Lewis et al., p. 1, Chunk #1]].\\n\\n## 2. Architectural Evolutions: From Transformers to RAG\\nThe introduction of multi-head self-attention eliminated recurrent constraints and established modern sequence-to-sequence modeling [[Vaswani et al., p. 2, Chunk #3]]. Building upon this, retrieval-augmented generation (RAG) decoupled parametric memorization from non-parametric factual retrieval, yielding substantial improvements in knowledge-intensive tasks [[Lewis et al., p. 4, Chunk #7]].\\n\\n## 3. Consensus and Conflicting Findings\\nWhile consensus exists regarding the superiority of transformer representations over recurrent models, recent empirical evidence challenges the assumption that larger context windows eliminate the need for retrieval. Specifically, Liu et al. revealed that retrieval performance degrades when relevant passages reside in the middle of long context windows, a phenomenon known as 'Lost in the Middle' [[Liu et al., p. 5, Chunk #11]]. Consequently, hybrid lexical-semantic chunking remains essential for high-fidelity retrieval.\\n\\n## 4. Limitations and Open Research Gaps\\nCurrent implementations are constrained by high latency in multi-hop graph traversals and vulnerability to contradictory cross-paper claims. Future research should prioritize explicit claim-level validation and automated conflict resolution.",
              "coverageWarning": null
            }
            """;
        }
        return "{}";
    }

    private int hashToken(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(token.getBytes(StandardCharsets.UTF_8));
            return ((digest[0] & 0xFF) << 24) | ((digest[1] & 0xFF) << 16) | ((digest[2] & 0xFF) << 8) | (digest[3] & 0xFF);
        } catch (NoSuchAlgorithmException e) {
            return token.hashCode();
        }
    }
}
