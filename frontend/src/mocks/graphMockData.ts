import { GraphResponse } from '../types/graph';

/**
 * High-fidelity demonstration mock dataset for graph visualizations.
 * NOTICE: Fictional/demo dataset strictly for visual interface preview and testing.
 * All relationships are synthetic and labeled with mock provenance.
 */

export const mockCitationGraph: GraphResponse = {
  nodes: [
    {
      id: 'paper:demo-1',
      type: 'PAPER',
      label: 'Attention Is All You Need',
      data: {
        paperId: 'demo-1',
        title: 'Attention Is All You Need',
        year: 2017,
        authors: ['Vaswani', 'Shazeer', 'Parmar'],
        venue: 'NeurIPS 2017',
        doi: '10.48550/arXiv.1706.03762',
        citationCount: 92400,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
      },
    },
    {
      id: 'paper:demo-2',
      type: 'PAPER',
      label: 'BERT: Pre-training of Deep Bidirectional Transformers',
      data: {
        paperId: 'demo-2',
        title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
        year: 2018,
        authors: ['Devlin', 'Chang', 'Lee', 'Toutanova'],
        venue: 'NAACL-HLT 2019',
        doi: '10.48550/arXiv.1810.04805',
        citationCount: 78500,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers.',
      },
    },
    {
      id: 'paper:demo-3',
      type: 'PAPER',
      label: 'Language Models are Few-Shot Learners',
      data: {
        paperId: 'demo-3',
        title: 'Language Models are Few-Shot Learners (GPT-3)',
        year: 2020,
        authors: ['Brown', 'Mann', 'Ryder', 'Subbiah'],
        venue: 'NeurIPS 2020',
        doi: '10.48550/arXiv.2005.14165',
        citationCount: 45200,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'We demonstrate that scaling up language models greatly improves task-agnostic, few-shot performance on diverse NLP tasks.',
      },
    },
    {
      id: 'paper:demo-4',
      type: 'PAPER',
      label: 'RoBERTa: A Robustly Optimized BERT Approach',
      data: {
        paperId: 'demo-4',
        title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach',
        year: 2019,
        authors: ['Liu', 'Ott', 'Goyal', 'Du'],
        venue: 'arXiv',
        doi: '10.48550/arXiv.1907.11692',
        citationCount: 19800,
        isImported: false,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'Language model pretraining has led to significant performance gains, but careful recipe adjustments uncover substantial under-training in BERT.',
      },
    },
    {
      id: 'paper:demo-5',
      type: 'PAPER',
      label: 'Retrieval-Augmented Generation for NLP',
      data: {
        paperId: 'demo-5',
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        year: 2020,
        authors: ['Lewis', 'Perez', 'Piktus', 'Petroni'],
        venue: 'NeurIPS 2020',
        doi: '10.48550/arXiv.2005.11401',
        citationCount: 14200,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'We explore general-purpose fine-tuning recipes for models that combine pre-trained parametric and non-parametric memory.',
      },
    },
    {
      id: 'paper:demo-6',
      type: 'PAPER',
      label: 'Chain-of-Thought Prompting in Large Language Models',
      data: {
        paperId: 'demo-6',
        title: 'Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
        year: 2022,
        authors: ['Wei', 'Wang', 'Schuurmans', 'Bosma'],
        venue: 'NeurIPS 2022',
        doi: '10.48550/arXiv.2201.11903',
        citationCount: 11300,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'Generating a series of intermediate reasoning steps significantly improves the ability of large language models to perform complex reasoning.',
      },
    },
    {
      id: 'paper:demo-7',
      type: 'PAPER',
      label: 'Llama: Open and Efficient Foundation Language Models',
      data: {
        paperId: 'demo-7',
        title: 'Llama: Open and Efficient Foundation Language Models',
        year: 2023,
        authors: ['Touvron', 'Lavril', 'Izacard', 'Martinet'],
        venue: 'arXiv',
        doi: '10.48550/arXiv.2302.13971',
        citationCount: 8900,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters trained exclusively on publicly available datasets.',
      },
    },
    {
      id: 'paper:demo-8',
      type: 'PAPER',
      label: 'FlashAttention: Fast and Memory-Efficient Exact Attention',
      data: {
        paperId: 'demo-8',
        title: 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
        year: 2022,
        authors: ['Dao', 'Fu', 'Ermon', 'Rudra'],
        venue: 'NeurIPS 2022',
        doi: '10.48550/arXiv.2205.14135',
        citationCount: 6400,
        isImported: true,
        provenance: 'REPORTED_IN_PAPER',
        abstract: 'Transformers are slow and memory-hungry on long sequences. We propose FlashAttention, an IO-aware exact attention algorithm that tiles computation.',
      },
    },
    {
      id: 'paper:demo-ext-1',
      type: 'UNRESOLVED_PAPER',
      label: 'Hochreiter & Schmidhuber (1997) Long Short-Term Memory',
      data: {
        title: 'Long Short-Term Memory',
        year: 1997,
        authors: ['Hochreiter', 'Schmidhuber'],
        venue: 'Neural Computation',
        doi: '10.1162/neco.1997.9.8.1735',
        isImported: false,
        isUnresolved: true,
        provenance: 'REPORTED_IN_PAPER',
      },
    },
    {
      id: 'paper:demo-ext-2',
      type: 'UNRESOLVED_PAPER',
      label: 'Bahdanau et al. (2014) Neural Machine Translation by Jointly Learning to Align and Translate',
      data: {
        title: 'Neural Machine Translation by Jointly Learning to Align and Translate',
        year: 2014,
        authors: ['Bahdanau', 'Cho', 'Bengio'],
        venue: 'ICLR 2015',
        doi: '10.48550/arXiv.1409.0473',
        isImported: false,
        isUnresolved: true,
        provenance: 'REPORTED_IN_PAPER',
      },
    },
  ],
  edges: [
    {
      id: 'citation:1-ext1',
      source: 'paper:demo-1',
      target: 'paper:demo-ext-1',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Hochreiter, S., & Schmidhuber, J. (1997). Long short-term memory. Neural computation, 9(8), 1735-1780.',
      },
    },
    {
      id: 'citation:1-ext2',
      source: 'paper:demo-1',
      target: 'paper:demo-ext-2',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Bahdanau, D., Cho, K., & Bengio, Y. (2014). Neural machine translation by jointly learning to align and translate.',
      },
    },
    {
      id: 'citation:2-1',
      source: 'paper:demo-2',
      target: 'paper:demo-1',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Vaswani, A., et al. (2017). Attention is all you need. In NeurIPS (pp. 5998-6008).',
      },
    },
    {
      id: 'citation:3-1',
      source: 'paper:demo-3',
      target: 'paper:demo-1',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Vaswani, A., et al. (2017). Attention is all you need.',
      },
    },
    {
      id: 'citation:4-2',
      source: 'paper:demo-4',
      target: 'paper:demo-2',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Devlin, J., et al. (2018). BERT: Pre-training of deep bidirectional transformers.',
      },
    },
    {
      id: 'citation:5-2',
      source: 'paper:demo-5',
      target: 'paper:demo-2',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Devlin, J., et al. (2018). BERT: Pre-training of deep bidirectional transformers.',
      },
    },
    {
      id: 'citation:5-3',
      source: 'paper:demo-5',
      target: 'paper:demo-3',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Brown, T., et al. (2020). Language models are few-shot learners.',
      },
    },
    {
      id: 'citation:6-3',
      source: 'paper:demo-6',
      target: 'paper:demo-3',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Brown, T., et al. (2020). Language models are few-shot learners.',
      },
    },
    {
      id: 'citation:7-1',
      source: 'paper:demo-7',
      target: 'paper:demo-1',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Vaswani, A., et al. (2017). Attention is all you need.',
      },
    },
    {
      id: 'citation:7-8',
      source: 'paper:demo-7',
      target: 'paper:demo-8',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Dao, T., et al. (2022). FlashAttention: Fast and memory-efficient exact attention with IO-awareness.',
      },
    },
    {
      id: 'citation:8-1',
      source: 'paper:demo-8',
      target: 'paper:demo-1',
      type: 'CITES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        rawReferenceText: 'Vaswani, A., et al. (2017). Attention is all you need.',
      },
    },
  ],
  metadata: {
    totalNodes: 10,
    totalEdges: 11,
    isTruncated: false,
    appliedFilters: { demo: true },
  },
};

export const mockConceptGraph: GraphResponse = {
  nodes: [
    // Papers
    {
      id: 'paper:demo-1',
      type: 'PAPER',
      label: 'Attention Is All You Need',
      data: {
        paperId: 'demo-1',
        title: 'Attention Is All You Need',
        year: 2017,
        provenance: 'REPORTED_IN_PAPER',
        isImported: true,
      },
    },
    {
      id: 'paper:demo-2',
      type: 'PAPER',
      label: 'BERT: Pre-training Transformers',
      data: {
        paperId: 'demo-2',
        title: 'BERT: Pre-training of Deep Bidirectional Transformers',
        year: 2018,
        provenance: 'REPORTED_IN_PAPER',
        isImported: true,
      },
    },
    {
      id: 'paper:demo-4',
      type: 'PAPER',
      label: 'RoBERTa: Robustly Optimized BERT',
      data: {
        paperId: 'demo-4',
        title: 'RoBERTa: A Robustly Optimized BERT Pretraining Approach',
        year: 2019,
        provenance: 'REPORTED_IN_PAPER',
        isImported: true,
      },
    },
    {
      id: 'paper:demo-5',
      type: 'PAPER',
      label: 'Retrieval-Augmented Generation',
      data: {
        paperId: 'demo-5',
        title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
        year: 2020,
        provenance: 'REPORTED_IN_PAPER',
        isImported: true,
      },
    },

    // Methods
    {
      id: 'method:transformer',
      type: 'METHOD',
      label: 'Transformer Architecture',
      data: {
        conceptType: 'METHOD',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Transformer Architecture',
      },
    },
    {
      id: 'method:masked-lm',
      type: 'METHOD',
      label: 'Masked Language Modeling (MLM)',
      data: {
        conceptType: 'METHOD',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Masked Language Modeling',
      },
    },
    {
      id: 'method:nsp',
      type: 'METHOD',
      label: 'Next Sentence Prediction (NSP)',
      data: {
        conceptType: 'METHOD',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Next Sentence Prediction',
      },
    },
    {
      id: 'method:rag',
      type: 'METHOD',
      label: 'Dense Retrieval + Parametric Generator',
      data: {
        conceptType: 'METHOD',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Dense Passage Retrieval RAG',
      },
    },

    // Datasets
    {
      id: 'dataset:glue',
      type: 'DATASET',
      label: 'GLUE Benchmark',
      data: {
        conceptType: 'DATASET',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'GLUE Benchmark',
      },
    },
    {
      id: 'dataset:squad',
      type: 'DATASET',
      label: 'SQuAD v1.1 / v2.0',
      data: {
        conceptType: 'DATASET',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Stanford Question Answering Dataset',
      },
    },
    {
      id: 'dataset:wmt14',
      type: 'DATASET',
      label: 'WMT 2014 En-De',
      data: {
        conceptType: 'DATASET',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'WMT 2014 English-to-German',
      },
    },

    // Concepts / Topics
    {
      id: 'concept:self-attention',
      type: 'CONCEPT',
      label: 'Self-Attention Mechanism',
      data: {
        conceptType: 'TOPIC',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Self-Attention Mechanism',
      },
    },
    {
      id: 'concept:hallucination',
      type: 'CONCEPT',
      label: 'Factuality & Hallucination Reduction',
      data: {
        conceptType: 'TOPIC',
        provenance: 'REPORTED_IN_PAPER',
        conceptName: 'Factuality & Hallucination Reduction',
      },
    },

    // Claims
    {
      id: 'claim:c1',
      type: 'CLAIM',
      label: 'Transformer achieves 28.4 BLEU on WMT 2014 En-De',
      data: {
        claimId: 'c1',
        paperId: 'demo-1',
        claimType: 'FINDING',
        provenance: 'REPORTED_IN_PAPER',
        confidence: 0.98,
        sectionName: 'Results',
        pageNumber: 8,
        sourceText: 'On the WMT 2014 English-to-German translation task, the big transformer model achieves a state-of-the-art BLEU score of 28.4.',
        normalizedText: 'Transformer big model achieves 28.4 BLEU score on WMT 2014 English-to-German translation task.',
      },
    },
    {
      id: 'claim:c2',
      type: 'CLAIM',
      label: 'Next Sentence Prediction (NSP) is crucial for pre-training BERT',
      data: {
        claimId: 'c2',
        paperId: 'demo-2',
        claimType: 'METHOD_ASSERTION',
        provenance: 'REPORTED_IN_PAPER',
        confidence: 0.94,
        sectionName: 'Ablation Studies',
        pageNumber: 7,
        sourceText: 'Removing NSP hurts performance significantly on QNLI (5.1%) and MNLI (1.0%), demonstrating that the pre-training task is essential.',
        normalizedText: 'Next Sentence Prediction task significantly improves downstream performance on sentence-pair tasks in BERT pre-training.',
      },
    },
    {
      id: 'claim:c3',
      type: 'CLAIM',
      label: 'Removing Next Sentence Prediction improves downstream performance',
      data: {
        claimId: 'c3',
        paperId: 'demo-4',
        claimType: 'FINDING',
        provenance: 'REPORTED_IN_PAPER',
        confidence: 0.96,
        sectionName: 'Training Methodology',
        pageNumber: 5,
        sourceText: 'We find that removing the NSP loss matches or slightly improves downstream task performance across GLUE tasks.',
        normalizedText: 'Removing the Next Sentence Prediction objective matches or improves performance when training on full sequences.',
      },
    },
    {
      id: 'claim:c4',
      type: 'CLAIM',
      label: 'RAG reduces factual hallucinations on open-domain QA',
      data: {
        claimId: 'c4',
        paperId: 'demo-5',
        claimType: 'FINDING',
        provenance: 'REPORTED_IN_PAPER',
        confidence: 0.91,
        sectionName: 'Generation Diversity and Factuality',
        pageNumber: 6,
        sourceText: 'RAG models generate more specific, diverse, and factual language than state-of-the-art parametric-only baselines.',
        normalizedText: 'Grounding generation with non-parametric dense retrieval reduces hallucinations in knowledge-intensive QA.',
      },
    },

    // AI Interpretation node
    {
      id: 'ai:synth-1',
      type: 'AI_INTERPRETATION',
      label: 'AI Synthesis: Pre-training Objective Evolution',
      data: {
        provenance: 'AI_INTERPRETATION',
        content: 'AI synthesized synthesis: The NSP objective proposed in BERT was later proven redundant by RoBERTa when longer sequences are packed without document boundaries.',
      },
    },

    // Evidence Chunks (Hidden by default, reveal on selection)
    {
      id: 'chunk:chunk-c2',
      type: 'CHUNK',
      label: 'Passage: BERT §5.1 Ablation',
      data: {
        chunkId: 'chunk-c2',
        sectionName: 'Section 5.1 Ablation Studies',
        pageNumber: 7,
        provenance: 'REPORTED_IN_PAPER',
        content: 'Table 2 shows the effect of the pre-training tasks. In "No NSP", we train without the next sentence prediction task. The scores show that removing NSP hurts performance significantly on QNLI and MNLI.',
      },
    },
    {
      id: 'chunk:chunk-c3',
      type: 'CHUNK',
      label: 'Passage: RoBERTa §4.2 Next Sentence Prediction',
      data: {
        chunkId: 'chunk-c3',
        sectionName: 'Section 4.2 Training Procedure',
        pageNumber: 5,
        provenance: 'REPORTED_IN_PAPER',
        content: 'Comparing across all tasks, we find that removing the NSP loss matches or slightly improves downstream task performance, suggesting NSP is not necessary when full contiguous texts are used.',
      },
    },
  ],

  edges: [
    // Paper to Method / Dataset
    {
      id: 'edge:p1-m1',
      source: 'paper:demo-1',
      target: 'method:transformer',
      type: 'USES_METHOD',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'proposes',
      },
    },
    {
      id: 'edge:p1-d1',
      source: 'paper:demo-1',
      target: 'dataset:wmt14',
      type: 'EVALUATED_ON',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'evaluated on',
      },
    },
    {
      id: 'edge:p1-c1',
      source: 'paper:demo-1',
      target: 'concept:self-attention',
      type: 'DISCUSSES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'relates to',
      },
    },
    {
      id: 'edge:p1-claim1',
      source: 'paper:demo-1',
      target: 'claim:c1',
      type: 'REPORTS',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'reports claim',
      },
    },

    // BERT relations
    {
      id: 'edge:p2-m1',
      source: 'paper:demo-2',
      target: 'method:transformer',
      type: 'USES_METHOD',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'extends',
      },
    },
    {
      id: 'edge:p2-m2',
      source: 'paper:demo-2',
      target: 'method:masked-lm',
      type: 'USES_METHOD',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'uses',
      },
    },
    {
      id: 'edge:p2-m3',
      source: 'paper:demo-2',
      target: 'method:nsp',
      type: 'USES_METHOD',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'proposes',
      },
    },
    {
      id: 'edge:p2-d-glue',
      source: 'paper:demo-2',
      target: 'dataset:glue',
      type: 'EVALUATED_ON',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'evaluated on',
      },
    },
    {
      id: 'edge:p2-d-squad',
      source: 'paper:demo-2',
      target: 'dataset:squad',
      type: 'EVALUATED_ON',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'evaluated on',
      },
    },
    {
      id: 'edge:p2-claim2',
      source: 'paper:demo-2',
      target: 'claim:c2',
      type: 'REPORTS',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'reports claim',
      },
    },

    // RoBERTa relations
    {
      id: 'edge:p4-claim3',
      source: 'paper:demo-4',
      target: 'claim:c3',
      type: 'REPORTS',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'reports claim',
      },
    },
    {
      id: 'edge:p4-d-glue',
      source: 'paper:demo-4',
      target: 'dataset:glue',
      type: 'EVALUATED_ON',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'evaluated on',
      },
    },

    // Claim-to-Claim Contradiction (Crucial!)
    {
      id: 'edge:claim3-contradicts-claim2',
      source: 'claim:c3',
      target: 'claim:c2',
      type: 'CONTRADICTS',
      data: {
        provenance: 'HUMAN_REVIEWED',
        reviewStatus: 'CONFIRMED',
        confidence: 0.95,
        rationale: 'RoBERTa empirical ablation demonstrates that removing the NSP loss matches or slightly improves GLUE performance, directly disputing BERT Claim 2.',
        sourceClaimText: 'Removing Next Sentence Prediction matches or improves performance when training on full sequences.',
        targetClaimText: 'Next Sentence Prediction is crucial for downstream sentence-pair tasks.',
        evidenceChunkIds: ['chunk:chunk-c2', 'chunk:chunk-c3'],
      },
    },

    // RAG and Hallucination Reduction
    {
      id: 'edge:p5-claim4',
      source: 'paper:demo-5',
      target: 'claim:c4',
      type: 'REPORTS',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'reports claim',
      },
    },
    {
      id: 'edge:p5-m4',
      source: 'paper:demo-5',
      target: 'method:rag',
      type: 'USES_METHOD',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'uses',
      },
    },
    {
      id: 'edge:claim4-conc-hallucination',
      source: 'claim:c4',
      target: 'concept:hallucination',
      type: 'DISCUSSES',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'addresses',
      },
    },

    // AI proposed relationship (Dashed, AI Proposed, pending review)
    {
      id: 'edge:ai-proposed-rel',
      source: 'claim:c4',
      target: 'claim:c1',
      type: 'EXTENDS',
      data: {
        provenance: 'AI_INTERPRETATION',
        reviewStatus: 'PENDING',
        confidence: 0.78,
        isAiProposed: true,
        rationale: 'AI Hypothesis: RAG architecture extends standard sequence-to-sequence Transformer attention with non-parametric retrieval indexing over Wikipedia.',
        label: 'AI proposed extension',
      },
    },

    // Evidence links
    {
      id: 'edge:c2-chunk',
      source: 'claim:c2',
      target: 'chunk:chunk-c2',
      type: 'HAS_EVIDENCE',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'grounded in passage',
      },
    },
    {
      id: 'edge:c3-chunk',
      source: 'claim:c3',
      target: 'chunk:chunk-c3',
      type: 'HAS_EVIDENCE',
      data: {
        provenance: 'REPORTED_IN_PAPER',
        label: 'grounded in passage',
      },
    },
  ],
  metadata: {
    totalNodes: 16,
    totalEdges: 18,
    isTruncated: false,
    appliedFilters: { demo: true },
  },
};

