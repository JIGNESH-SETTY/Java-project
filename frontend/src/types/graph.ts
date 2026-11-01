export type GraphNodeType =
  | 'PAPER'
  | 'CONCEPT'
  | 'CLAIM'
  | 'CHUNK'
  | 'DATASET'
  | 'METHOD'
  | 'AI_INTERPRETATION'
  | 'UNRESOLVED_PAPER';

export type GraphEdgeType =
  | 'CITES'
  | 'REPORTS'
  | 'HAS_EVIDENCE'
  | 'USES_METHOD'
  | 'EVALUATED_ON'
  | 'SUPPORTS'
  | 'CONTRADICTS'
  | 'QUALIFIES'
  | 'EXTENDS'
  | 'DISCUSSES'
  | 'AI_PROPOSED';

export type GraphProvenance =
  | 'REPORTED_IN_PAPER'
  | 'AI_INTERPRETATION'
  | 'USER_ASSERTED'
  | 'HUMAN_REVIEWED';

export type GraphReviewStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface GraphNodeData {
  paperId?: string;
  claimId?: string;
  conceptId?: string;
  chunkId?: string;
  title?: string;
  year?: number | string;
  authors?: string[] | string;
  venue?: string;
  doi?: string;
  citationCount?: number;
  isImported?: boolean;
  isUnresolved?: boolean;
  provenance?: GraphProvenance;
  claimType?: string;
  sectionName?: string;
  pageNumber?: number;
  sourceText?: string;
  normalizedText?: string;
  confidence?: number;
  conceptType?: string;
  content?: string;
  [key: string]: any;
}

export interface GraphEdgeData {
  provenance?: GraphProvenance;
  reviewStatus?: GraphReviewStatus | null;
  confidence?: number | null;
  rationale?: string | null;
  label?: string;
  rawReferenceText?: string;
  sourceClaimText?: string;
  targetClaimText?: string;
  evidenceChunkIds?: string[];
  [key: string]: any;
}

export interface GraphNode {
  id: string; // e.g. "paper:uuid", "claim:uuid"
  type: GraphNodeType;
  label: string;
  data: GraphNodeData;
}

export interface GraphEdge {
  id: string; // e.g. "citation:uuid", "rel:uuid"
  source: string;
  target: string;
  type: GraphEdgeType;
  data: GraphEdgeData;
}

export interface GraphMetadata {
  totalNodes: number;
  totalEdges: number;
  isTruncated: boolean;
  appliedFilters: Record<string, any>;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: GraphMetadata;
}

export interface CitationGraphFilters {
  collectionId?: string;
  paperId?: string;
  yearFrom?: number;
  yearTo?: number;
  author?: string;
  importedOnly?: boolean;
  citationDepth?: number;
  query?: string;
  limit?: number;
}

export interface ConceptGraphFilters {
  collectionId?: string;
  paperId?: string;
  claimId?: string;
  nodeTypes?: GraphNodeType[];
  relationshipTypes?: GraphEdgeType[];
  provenanceTypes?: GraphProvenance[];
  reviewStatus?: GraphReviewStatus[];
  showEvidenceChunks?: boolean;
  query?: string;
  limit?: number;
}

export interface GraphNodeDetails {
  node: GraphNode;
  connectedEdges: GraphEdge[];
  neighborNodes: GraphNode[];
  provenance: GraphProvenance;
  evidenceSnippets?: Array<{
    chunkId: string;
    sectionName: string;
    pageNumber?: number;
    text: string;
    paperTitle?: string;
  }>;
}

export interface GraphEdgeDetails {
  edge: GraphEdge;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  evidenceList?: Array<{
    chunkId: string;
    role: string;
    snippet: string;
  }>;
}

