import type { NodeTypes } from '@xyflow/react';
import { PaperNode } from './PaperNode';
import { ClaimNode } from './ClaimNode';
import { ConceptNode } from './ConceptNode';
import { DatasetNode } from './DatasetNode';
import { EvidenceNode } from './EvidenceNode';

export const nodeTypes: NodeTypes = {
  paper: PaperNode,
  claim: ClaimNode,
  concept: ConceptNode,
  dataset: DatasetNode,
  evidence: EvidenceNode,
};

export { PaperNode, ClaimNode, ConceptNode, DatasetNode, EvidenceNode };

