export type ProvenanceType = 'REPORTED_IN_PAPER' | 'AI_INTERPRETATION' | 'USER_ANNOTATION' | 'USER_ASSERTED';

export type ClaimType = 'FINDING' | 'HYPOTHESIS' | 'METHOD_ASSERTION' | 'LIMITATION' | 'DATASET_ASSERTION' | 'BACKGROUND';

export type RelationType = 'SUPPORTS' | 'CONTRADICTS' | 'QUALIFIES' | 'EXTENDS' | 'DISCUSSES' | 'DUPLICATES' | 'UNRELATED';

export type ReviewStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export type JobStatus = 'PENDING' | 'PARSING' | 'CHUNKING' | 'EMBEDDING' | 'EXTRACTING_ASPECTS' | 'COMPLETED' | 'FAILED';

export interface IngestionJob {
  id: string;
  paperId: string;
  status: JobStatus;
  currentStage?: string;
  warningMessage?: string;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface Paper {
  id: string;
  ownerId: string;
  title: string;
  abstractText?: string;
  doi?: string;
  publicationYear?: number;
  venue?: string;
  documentPath?: string;
  processingStatus: string;
  processingError?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: string;
  normalizedName: string;
  displayName: string;
  orcid?: string;
}

export interface DocumentChunk {
  id: string;
  paperId: string;
  chunkIndex: number;
  sectionName: string;
  pageNumber?: number;
  charStart: number;
  charEnd: number;
  content: string;
  tokenCount: number;
  embeddingModel?: string;
  createdAt: string;
}

export interface PaperConcept {
  paperId: string;
  conceptId: string;
  conceptName: string;
  conceptType: string;
  relationType: string;
  evidenceChunkId?: string;
  confidence: number;
  provenanceType: ProvenanceType;
}

export interface PaperReference {
  id: string;
  sourcePaperId: string;
  rawReferenceText: string;
  citedPaperId?: string;
  citedTitle?: string;
  citedDoi?: string;
  resolutionStatus: string;
  createdAt: string;
}

export interface PaperDetail {
  paper: Paper;
  authors: Author[];
  concepts: PaperConcept[];
  references: PaperReference[];
  claims: Claim[];
  chunks: DocumentChunk[];
  totalChunks: number;
  totalClaims: number;
}

export interface PaperSummary {
  paper: Paper;
  authors: Author[];
  chunkCount: number;
  claimCount: number;
}

export interface Claim {
  id: string;
  paperId?: string;
  sourceChunkId?: string;
  normalizedText: string;
  sourceText: string;
  claimType: ClaimType;
  provenanceType: ProvenanceType;
  extractionConfidence: number;
  sectionName?: string;
  pageNumber?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimRelation {
  id: string;
  sourceClaimId: string;
  targetClaimId: string;
  relationType: RelationType;
  confidence: number;
  rationale: string;
  provenanceType: ProvenanceType;
  reviewStatus: ReviewStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  evidenceChunkIds: string[];
}

export interface ClaimDetail {
  claim: Claim;
  paperTitle: string;
  relations: ClaimRelation[];
}

export interface SearchResult {
  chunkId: string;
  paperId: string;
  paperTitle: string;
  publicationYear?: number;
  venue?: string;
  authors: string[];
  sectionName: string;
  pageNumber?: number;
  chunkIndex: number;
  snippet: string;
  combinedScore: number;
  semanticScore: number;
  lexicalScore: number;
  scoringRationale: string;
}

export interface ComparisonCell {
  content: string;
  evidenceChunkIds: string[];
  provenance: ProvenanceType;
}

export interface ComparisonRow {
  aspectKey: string;
  aspectLabel: string;
  cells: Record<string, ComparisonCell>;
}

export interface ComparisonSynthesis {
  synthesisMarkdown: string;
  consensusPoints: string[];
  divergencePoints: string[];
  evidenceChunkIds: string[];
}

export interface ComparisonResult {
  papers: PaperSummary[];
  rows: ComparisonRow[];
  aiSynthesis: ComparisonSynthesis;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationType: string;
  provenance: ProvenanceType;
  confidence: number;
  rationale: string;
  isAiProposed: boolean;
}

export interface GraphResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  totalNodes: number;
  totalEdges: number;
}

export interface ReviewEvidenceItem {
  id: string;
  paragraphIndex: number;
  chunkId: string;
  paperId: string;
  paperTitle: string;
  pageNumber?: number;
  sectionName: string;
  snippet: string;
  citationLabel: string;
  evidenceRole: string;
}

export interface ReviewDetail {
  id: string;
  query: string;
  title: string;
  contentMarkdown: string;
  modelName: string;
  status: string;
  coverageWarning?: string;
  createdAt: string;
  evidence: ReviewEvidenceItem[];
}

export interface ReviewSummary {
  id: string;
  query: string;
  title: string;
  modelName: string;
  status: string;
  createdAt: string;
  evidenceCount: number;
}

export interface Collection {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  paperCount: number;
  paperIds: string[];
}

export interface Annotation {
  id: string;
  userId: string;
  paperId?: string;
  chunkId?: string;
  claimId?: string;
  body: string;
  annotationType: string;
  createdAt: string;
  updatedAt: string;
}
