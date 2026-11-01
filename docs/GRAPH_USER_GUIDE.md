# AI Research Discovery Engine — Graph User Guide

Welcome to the interactive Graph Explorer of the **AI Research Discovery and Evidence Engine**! This guide is designed for computer science students, academic researchers, and developers exploring interconnected academic literature.

The engine provides two visualization engines:
1. **Card Relationship Map (Primary)**: Powered by **React Flow (`@xyflow/react`)** and **ELK.js**, rendering rich, tactile pastel cards with layered 3D shadows on a dark charcoal canvas with automatic top-to-bottom hierarchical layout.
2. **Dense Network Graph**: Powered by **Cytoscape.js**, designed for multi-thousand node force-directed cluster analysis and dense cyclic graphs.

You can switch between both engines with a single click using the **Card Map** / **Dense Graph** toggle in the top toolbar.

---

## 1. Visual Encodings & Design System

The graph interface is built using Cytoscape.js with a light glassmorphism aesthetic matching the application dashboard. Every visual attribute (shape, color, line style) conveys specific semantic meaning.

### Node Encodings

| Node Type | Visual Shape | Default Color | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **Paper** | Circle | Coral / Salmon (`#FF6F61`) | Published academic paper in your collection or index |
| **Claim** | Diamond | Purple (`#8B5CF6`) | Factual or empirical scientific claim extracted from a paper |
| **Method** | Rounded Rectangle | Emerald Green (`#10B981`) | Architecture, algorithm, or methodology (e.g., *Self-Attention*, *LoRA*) |
| **Dataset** | Hexagon | Blue (`#3B82F6`) | Evaluation benchmark or training dataset (e.g., *SQuAD*, *GLUE*) |
| **Concept** | Rounded Rectangle | Indigo (`#6366F1`) | High-level topic or paradigm (e.g., *Few-shot Learning*, *Transformers*) |
| **Metric** | Rounded Rectangle | Cyan (`#06B6D4`) | Quantitative evaluation metric (e.g., *BLEU Score*, *Perplexity*) |
| **Task** | Rounded Rectangle | Amber (`#F59E0B`) | NLP or ML problem domain (e.g., *Machine Translation*, *NER*) |
| **Chunk** | Small Rectangle | Slate (`#64748B`) | Verbatim text passage from a paper providing empirical grounding |

---

### Edge Encodings (Relationships & Line Styles)

| Edge Type | Line Style | Color | Meaning |
| :--- | :--- | :--- | :--- |
| **CITES** | Solid line with arrow | Slate Blue (`#64748B`) | Paper A explicitly cites Paper B |
| **CITES_EXTERNAL** | Dotted line with arrow | Muted Gray (`#94A3B8`) | Citation to an external paper not yet indexed in the database |
| **SUPPORTS** | Solid line | Green (`#10B981`) | Claim A or evidence provides empirical support for Claim B |
| **CONTRADICTS** | Solid line | Red (`#EF4444`) | Claim A challenges or refutes Claim B |
| **QUALIFIES** | Solid line | Amber (`#F59E0B`) | Claim A bounds, limits, or scopes Claim B (e.g., "only under low-data regime") |
| **EXTENDS** | Solid line | Indigo (`#6366F1`) | Method A or Paper A builds directly upon Method B |
| **USES_METHOD** | Solid line | Emerald (`#059669`) | Paper utilizes a specific algorithm or technique |
| **EVALUATED_ON** | Solid line | Blue (`#2563EB`) | Paper evaluates its methodology on a specific dataset |
| **EXTRACTED_FROM** | Dashed line | Gray (`#64748B`) | Direct provenance linking a Claim back to its source Paper Chunk |

---

## 2. Provenance & Scientific Integrity

A core principle of this engine is **zero fabrication**. In academic research, confusing a factual statement from a peer-reviewed paper with an AI-generated hypothesis can lead to invalid conclusions.

Every edge and claim displays its **provenance source**:

1. `REPORTED_IN_PAPER` (Ground Truth):
   - Extracted directly from author statements in the publication.
   - Represented with solid edge lines.
   - Displays page number and verbatim excerpt in the Details Panel.

2. `AI_INTERPRETATION` (Proposed / Unverified):
   - Inferred or synthesized by an LLM (Gemini, Claude, GPT, or Ollama) during multi-document analysis.
   - Represented with **dashed edge lines** and a yellow/amber notice banner in the Details Panel.
   - Clearly flagged as unreviewed until a human audits the reasoning.

3. `USER_ASSERTED`:
   - Manually added by you or a collaborator during literature review.

4. `HUMAN_REVIEWED`:
   - An AI proposal or user assertion that has been audited and confirmed or rejected by a domain researcher.

---

## 3. How to Explore the Citation Graph (`/graph/citations`)

1. **Accessing the Page**:
   - Navigate to `/graph/citations` in your browser.
2. **Interactive Canvas Operations**:
   - **Pan**: Click and drag on any empty space on the canvas.
   - **Zoom**: Scroll your mouse wheel or pinch on a trackpad. Alternatively, use the `+` and `-` buttons in the floating toolbar.
   - **Fit View**: Click the **Fit** icon in the floating toolbar to center and fit all visible nodes into the viewport.
   - **Select Node**: Click any node to select it. Connected edges and neighbor nodes will highlight; the right-hand **Details Panel** will display full paper metadata, authors, publication date, abstract, and incoming/outgoing citation counts.
3. **Filter Controls (Left Panel)**:
   - **Search / Seed Paper**: Enter a title or DOI to highlight a specific paper.
   - **Publication Year Range**: Drag the slider to isolate foundational historical papers or focus exclusively on recent advances.
   - **Citation Depth (1-3 hops)**: Limit traversal depth to keep complex citation trees legible.
   - **External Citations Toggle**: Include or exclude unindexed external reference nodes.
   - **Mock Data Toggle**: Switch between realistic offline demonstration data and the live Spring Boot PostgreSQL database.
4. **Layout Switching**:
   - Use the Layout dropdown in the toolbar to switch algorithms:
     - **CoSE (Compound Spring Embedder)**: Physics-based force-directed layout ideal for natural cluster discovery.
     - **Concentric**: Places high-citation landmark papers in the inner rings and newer papers in outer rings.
     - **Breadthfirst (Hierarchical)**: Tree-like layout showing chronological or dependency flows.
     - **Circle**: Arranges all nodes equidistant around a perimeter for inspecting cross-citations.

---

## 4. How to Explore the Concept & Evidence Graph (`/graph/concepts`)

1. **Accessing the Page**:
   - Navigate to `/graph/concepts`.
2. **Filtering by Entity Type**:
   - Toggle Papers, Concepts, Claims, Methods, and Datasets in the left filter panel.
3. **Filtering by Relationship**:
   - Select or deselect specific semantic relationships (e.g., focus exclusively on `CONTRADICTS` to uncover scientific disagreements in the literature).
4. **Inspecting Evidence**:
   - Enable the **Show Evidence Chunks** checkbox to view granular paper chunks.
   - Selecting a `CONTRADICTS` or `SUPPORTS` edge opens the **Edge Inspector** on the right, displaying:
     - Edge Type and confidence score.
     - Provenance tag (`AI_INTERPRETATION` vs `REPORTED_IN_PAPER`).
     - Verbatim excerpt from Paper A alongside Paper B.
     - Rationale explanation explaining why the two claims conflict or align.
5. **Auditing AI-Proposed Relationships**:
   - When inspecting an `AI_INTERPRETATION` edge, click **Confirm** or **Reject** to persist your human-in-the-loop review to PostgreSQL.

---

## 5. Accessibility & Export

- **Accessible List View**:
  - Click the **List View** toggle button in the floating toolbar to switch from the Cytoscape canvas to an accessible, screen-reader friendly data table listing all nodes and edges with sorting and filtering.
- **High-Resolution PNG Export**:
  - Click the **Camera / Download** icon in the toolbar to instantly generate and download a transparent, publication-ready PNG diagram of your current graph view.

