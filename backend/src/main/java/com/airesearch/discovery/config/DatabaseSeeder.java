package com.airesearch.discovery.config;

import com.airesearch.discovery.ai.AiService;
import com.airesearch.discovery.auth.model.User;
import com.airesearch.discovery.auth.repository.UserRepository;
import com.airesearch.discovery.claims.model.Claim;
import com.airesearch.discovery.claims.model.ClaimRelation;
import com.airesearch.discovery.claims.repository.ClaimRelationRepository;
import com.airesearch.discovery.claims.repository.ClaimRepository;
import com.airesearch.discovery.collection.repository.CollectionRepository;
import com.airesearch.discovery.paper.model.DocumentChunk;
import com.airesearch.discovery.paper.model.Paper;
import com.airesearch.discovery.paper.repository.*;
import com.airesearch.discovery.review.repository.ReviewRepository;
import com.airesearch.discovery.review.repository.ReviewRepository.GeneratedReviewEntity;
import com.airesearch.discovery.review.dto.ReviewDtos.ReviewEvidenceItem;
import com.airesearch.discovery.shared.enums.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;
    private final PaperRepository paperRepository;
    private final AuthorRepository authorRepository;
    private final ReferenceRepository referenceRepository;
    private final DocumentChunkRepository chunkRepository;
    private final ConceptRepository conceptRepository;
    private final ClaimRepository claimRepository;
    private final ClaimRelationRepository claimRelationRepository;
    private final CollectionRepository collectionRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final AiService aiService;

    public DatabaseSeeder(
            UserRepository userRepository,
            PaperRepository paperRepository,
            AuthorRepository authorRepository,
            ReferenceRepository referenceRepository,
            DocumentChunkRepository chunkRepository,
            ConceptRepository conceptRepository,
            ClaimRepository claimRepository,
            ClaimRelationRepository claimRelationRepository,
            CollectionRepository collectionRepository,
            ReviewRepository reviewRepository,
            PasswordEncoder passwordEncoder,
            AiService aiService) {
        this.userRepository = userRepository;
        this.paperRepository = paperRepository;
        this.authorRepository = authorRepository;
        this.referenceRepository = referenceRepository;
        this.chunkRepository = chunkRepository;
        this.conceptRepository = conceptRepository;
        this.claimRepository = claimRepository;
        this.claimRelationRepository = claimRelationRepository;
        this.collectionRepository = collectionRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
        this.aiService = aiService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.existsByEmail("admin@airesearch.edu")) {
            log.info("Database already seeded with demo user.");
            return;
        }

        log.info("Seeding database with default accounts and 4 foundational research papers...");

        // 1. Create Default Users
        User admin = userRepository.save(new User(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                "admin@airesearch.edu",
                passwordEncoder.encode("admin123"),
                "Dr. Alan Turing",
                UserRole.ROLE_ADMIN,
                Instant.now(),
                Instant.now()
        ));

        User student = userRepository.save(new User(
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                "student@airesearch.edu",
                passwordEncoder.encode("student123"),
                "Alex Chen (B.Tech CSE)",
                UserRole.ROLE_USER,
                Instant.now(),
                Instant.now()
        ));

        // 2. Paper 1: Vaswani et al. (Transformers)
        UUID p1Id = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        Paper paper1 = paperRepository.save(new Paper(
                p1Id,
                admin.id(),
                "Attention Is All You Need: Scalable Transformers for Sequence Modeling",
                "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer, a model architecture eschewing recurrence and entirely relying on an attention mechanism to draw global dependencies between input and output.",
                "10.5555/3295222.3295349",
                2017,
                "NeurIPS 2017",
                "sample/attention_is_all_you_need.pdf",
                "COMPLETED",
                null,
                PaperVisibility.PUBLIC,
                Instant.now(),
                Instant.now()
        ));
        linkAuthors(p1Id, List.of("Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"));

        // Paper 1 Chunks
        UUID c1_1 = UUID.randomUUID();
        UUID c1_2 = UUID.randomUUID();
        DocumentChunk chunk1_1 = createChunk(c1_1, p1Id, 0, "Introduction", 1,
                "Recurrent models typically factor computation along the symbol positions of the input and output sequences. Aligning the positions to steps in computation time, they generate a sequence of hidden states. This inherently sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths.");
        DocumentChunk chunk1_2 = createChunk(c1_2, p1Id, 1, "Model Architecture", 3,
                "The Transformer is the first transduction model relying entirely on self-attention to compute representations of its input and output without using sequence-aligned RNNs or convolution. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.");
        chunkRepository.saveBatch(List.of(chunk1_1, chunk1_2));

        // Paper 1 Claim
        Claim claim1 = claimRepository.save(new Claim(
                UUID.randomUUID(),
                p1Id,
                c1_2,
                "Multi-head self-attention eliminates sequential recurrence bottlenecks and enables massive training parallelization.",
                "The Transformer is the first transduction model relying entirely on self-attention to compute representations without using sequence-aligned RNNs, allowing significant parallelization.",
                ClaimType.METHOD_ASSERTION,
                ProvenanceType.REPORTED_IN_PAPER,
                0.98,
                "Model Architecture",
                3,
                admin.id(),
                Instant.now(),
                Instant.now()
        ));

        // 3. Paper 2: Lewis et al. (RAG)
        UUID p2Id = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");
        Paper paper2 = paperRepository.save(new Paper(
                p2Id,
                admin.id(),
                "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
                "Large pre-trained language models store factual knowledge in their parameters, but their ability to access and precisely manipulate knowledge is limited, leading to hallucinations. We introduce RAG models which combine pre-trained parametric memory with non-parametric retrieval memory over Wikipedia.",
                "10.48550/arXiv.2005.11401",
                2020,
                "NeurIPS 2020",
                "sample/retrieval_augmented_generation.pdf",
                "COMPLETED",
                null,
                PaperVisibility.PUBLIC,
                Instant.now(),
                Instant.now()
        ));
        linkAuthors(p2Id, List.of("Patrick Lewis", "Ethan Perez", "Aleksandra Piktus", "Fabio Petroni", "Vladimir Karpukhin", "Naman Goyal", "Heinrich Kuttler", "Mike Lewis", "Wen-tau Yih", "Tim Rocktaschel", "Sebastian Riedel", "Douwe Kiela"));

        UUID c2_1 = UUID.randomUUID();
        UUID c2_2 = UUID.randomUUID();
        DocumentChunk chunk2_1 = createChunk(c2_1, p2Id, 0, "Introduction", 1,
                "Pre-trained language models have been shown to capture vast amounts of factual knowledge in their parameters. However, their internal memory is fixed, leading to hallucinations on knowledge-intensive benchmarks. We propose Retrieval-Augmented Generation (RAG), combining pre-trained seq2seq models with a dense vector index of Wikipedia accessed via Maximum Inner Product Search (MIPS).");
        DocumentChunk chunk2_2 = createChunk(c2_2, p2Id, 1, "Results & Discussion", 5,
                "RAG models achieve state-of-the-art results on open-domain QA benchmarks including Natural Questions and TriviaQA. Unlike purely parametric models, RAG allows factual knowledge to be updated simply by swapping or appending the non-parametric document index without expensive retraining.");
        chunkRepository.saveBatch(List.of(chunk2_1, chunk2_2));

        Claim claim2 = claimRepository.save(new Claim(
                UUID.randomUUID(),
                p2Id,
                c2_1,
                "Decoupling parametric sequence models from non-parametric retrieval memory reduces hallucinations on open-domain QA.",
                "We propose Retrieval-Augmented Generation (RAG), combining pre-trained seq2seq models with a dense vector index, reducing factual hallucination.",
                ClaimType.FINDING,
                ProvenanceType.REPORTED_IN_PAPER,
                0.95,
                "Introduction",
                1,
                admin.id(),
                Instant.now(),
                Instant.now()
        ));

        // 4. Paper 3: Liu et al. (Lost in the Middle)
        UUID p3Id = UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc");
        Paper paper3 = paperRepository.save(new Paper(
                p3Id,
                admin.id(),
                "Lost in the Middle: How Language Models Use Long Contexts",
                "While recent language models support context windows of 32k tokens or more, little is known about how effectively models use information located at different positions within their context. We show that performance degrades dramatically when key information is located in the middle of the input context.",
                "10.1162/tacl_a_00638",
                2023,
                "TACL 2023",
                "sample/lost_in_the_middle.pdf",
                "COMPLETED",
                null,
                PaperVisibility.PUBLIC,
                Instant.now(),
                Instant.now()
        ));
        linkAuthors(p3Id, List.of("Nelson F. Liu", "Kevin Lin", "John Hewitt", "Ashwin Paranjape", "Michele Bevilacqua", "Fabio Petroni", "Percy Liang"));

        UUID c3_1 = UUID.randomUUID();
        DocumentChunk chunk3_1 = createChunk(c3_1, p3Id, 0, "Experiments & Findings", 4,
                "We find that language model performance is highest when relevant information occurs at the beginning or end of the input context, and degrades significantly when models must access relevant information in the middle of long contexts. This U-shaped retrieval curve persists across diverse commercial and open-weights models.");
        chunkRepository.saveBatch(List.of(chunk3_1));

        Claim claim3 = claimRepository.save(new Claim(
                UUID.randomUUID(),
                p3Id,
                c3_1,
                "Language model retrieval accuracy follows a U-shaped curve, degrading significantly when relevant facts are situated in the middle of long contexts.",
                "Performance degrades significantly when models must access relevant information in the middle of long contexts, following a characteristic U-shaped degradation curve.",
                ClaimType.LIMITATION,
                ProvenanceType.REPORTED_IN_PAPER,
                0.96,
                "Experiments & Findings",
                4,
                admin.id(),
                Instant.now(),
                Instant.now()
        ));

        // 5. Paper 4: Devlin et al. (BERT)
        UUID p4Id = UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd");
        Paper paper4 = paperRepository.save(new Paper(
                p4Id,
                admin.id(),
                "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
                "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
                "10.18653/v1/N19-1423",
                2018,
                "NAACL-HLT 2019",
                "sample/bert_paper.pdf",
                "COMPLETED",
                null,
                PaperVisibility.PUBLIC,
                Instant.now(),
                Instant.now()
        ));
        linkAuthors(p4Id, List.of("Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"));

        UUID c4_1 = UUID.randomUUID();
        DocumentChunk chunk4_1 = createChunk(c4_1, p4Id, 0, "Methodology", 2,
                "BERT uses a Masked Language Model (MLM) pre-training objective. The masked language model randomly masks some of the tokens from the input, and the objective is to predict the original vocabulary id of the masked word based only on its context.");
        chunkRepository.saveBatch(List.of(chunk4_1));

        // 6. Citations
        referenceRepository.saveReferences(p2Id, List.of(
                "Vaswani, A., et al. (2017). Attention is all you need. Advances in Neural Information Processing Systems, 30.",
                "Devlin, J., et al. (2018). BERT: Pre-training of deep bidirectional transformers for language understanding. arXiv:1810.04805."
        ));

        // 7. Concepts
        var cTransformer = conceptRepository.findOrCreate("Transformer", ConceptType.METHOD);
        var cRAG = conceptRepository.findOrCreate("Retrieval-Augmented Generation", ConceptType.METHOD);
        var cAttention = conceptRepository.findOrCreate("Multi-Head Attention", ConceptType.METHOD);
        var cLostInMiddle = conceptRepository.findOrCreate("Lost in the Middle", ConceptType.PROBLEM);
        var cQA = conceptRepository.findOrCreate("Open-Domain QA", ConceptType.TOPIC);

        conceptRepository.linkPaperConcept(p1Id, cTransformer.id(), "PROPOSES", c1_2, 1.0, ProvenanceType.REPORTED_IN_PAPER);
        conceptRepository.linkPaperConcept(p1Id, cAttention.id(), "PROPOSES", c1_2, 1.0, ProvenanceType.REPORTED_IN_PAPER);
        conceptRepository.linkPaperConcept(p2Id, cRAG.id(), "PROPOSES", c2_1, 1.0, ProvenanceType.REPORTED_IN_PAPER);
        conceptRepository.linkPaperConcept(p2Id, cQA.id(), "EVALUATES_ON", c2_2, 0.95, ProvenanceType.REPORTED_IN_PAPER);
        conceptRepository.linkPaperConcept(p3Id, cLostInMiddle.id(), "DISCOVERS", c3_1, 0.98, ProvenanceType.REPORTED_IN_PAPER);

        // 8. Cross-Claim Relationships
        // Relation 1: RAG EXTENDS Transformer
        claimRelationRepository.save(new ClaimRelation(
                UUID.randomUUID(),
                claim2.id(),
                claim1.id(),
                RelationType.EXTENDS,
                0.92,
                "Lewis et al. builds directly on the Transformer seq2seq foundation by coupling it with non-parametric retrieval memory.",
                ProvenanceType.AI_INTERPRETATION,
                ReviewStatus.CONFIRMED,
                admin.id(),
                Instant.now(),
                Instant.now(),
                List.of(c2_1, c1_2)
        ), List.of(c2_1, c1_2));

        // Relation 2: Lost in the Middle QUALIFIES pure context window expansion
        claimRelationRepository.save(new ClaimRelation(
                UUID.randomUUID(),
                claim3.id(),
                claim2.id(),
                RelationType.QUALIFIES,
                0.89,
                "Liu et al. shows that simply packing retrieved chunks into long context windows degrades accuracy if key evidence falls into the middle.",
                ProvenanceType.AI_INTERPRETATION,
                ReviewStatus.CONFIRMED,
                admin.id(),
                Instant.now(),
                Instant.now(),
                List.of(c3_1, c2_1)
        ), List.of(c3_1, c2_1));

        // 9. Sample Collection
        var collection = collectionRepository.save(new CollectionRepository.CollectionEntity(
                UUID.randomUUID(),
                admin.id(),
                "Foundational Neural Architectures & RAG",
                "Core seminal papers exploring transformers, retrieval augmentation, and context window dynamics.",
                Instant.now(),
                Instant.now()
        ));
        collectionRepository.addPaper(collection.id(), p1Id);
        collectionRepository.addPaper(collection.id(), p2Id);
        collectionRepository.addPaper(collection.id(), p3Id);
        collectionRepository.addPaper(collection.id(), p4Id);

        // 10. Sample Review
        UUID reviewId = UUID.randomUUID();
        String reviewMarkdown = """
            ## 1. Introduction
            Synthesizing neural representation learning reveals a fundamental architectural transition from recurrent models toward self-attention mechanisms and hybrid retrieval architectures [[Attention Is All You Need, p. 1, Chunk #0]].
            
            ## 2. Decoupling Parametric and Retrieval Memory
            While transformers excel at sequence representation, internal parameter memorization remains susceptible to hallucinations on knowledge-intensive benchmarks. Lewis et al. address this by introducing Retrieval-Augmented Generation, combining sequence models with an external dense vector index [[Retrieval-Augmented Generation, p. 1, Chunk #0]].
            
            ## 3. Position Bias and Context Limitations
            Although context windows have expanded dramatically, empirical investigations by Liu et al. prove that retrieval efficacy depends heavily on evidence position, revealing a pronounced U-shaped degradation curve when pertinent facts reside in the middle of long contexts [[Lost in the Middle, p. 4, Chunk #0]].
            
            ## 4. Conclusion
            Effective scholarly synthesis requires integrating hybrid lexical-semantic chunking with active claim-evidence tracking to prevent ungrounded model outputs.
            """;

        reviewRepository.save(new GeneratedReviewEntity(
                reviewId,
                admin.id(),
                collection.id(),
                "How does Retrieval-Augmented Generation address context limitations in transformers?",
                "Evidence-Backed Review: Retrieval Augmentation and Context Dynamics in Modern NLP",
                reviewMarkdown,
                "mock-ai-engine",
                "COMPLETED",
                Instant.now(),
                Instant.now()
        ));

        reviewRepository.saveEvidenceBatch(reviewId, List.of(
                new ReviewEvidenceItem(UUID.randomUUID(), 0, c1_1, p1Id, paper1.title(), 1, "Introduction", chunk1_1.content(), "Chunk #0", EvidenceRole.PRIMARY_SUPPORT),
                new ReviewEvidenceItem(UUID.randomUUID(), 1, c2_1, p2Id, paper2.title(), 1, "Introduction", chunk2_1.content(), "Chunk #0", EvidenceRole.PRIMARY_SUPPORT),
                new ReviewEvidenceItem(UUID.randomUUID(), 2, c3_1, p3Id, paper3.title(), 4, "Experiments & Findings", chunk3_1.content(), "Chunk #0", EvidenceRole.QUALIFICATION)
        ));

        log.info("Database seeding successfully completed with 4 papers, 6 chunks, 3 claims, 2 relations, 1 collection, and 1 review!");
    }

    private DocumentChunk createChunk(UUID id, UUID paperId, int index, String section, int page, String text) {
        float[] emb = aiService.embed(text);
        return new DocumentChunk(
                id,
                paperId,
                index,
                section,
                page,
                0,
                text.length(),
                text,
                text.length() / 4,
                emb,
                "all-minilm-l6-v2",
                Instant.now()
        );
    }

    private void linkAuthors(UUID paperId, List<String> authors) {
        int order = 1;
        for (String a : authors) {
            var rec = authorRepository.findOrCreate(a, null);
            authorRepository.linkPaperAuthor(paperId, rec.id(), order++);
        }
    }
}
