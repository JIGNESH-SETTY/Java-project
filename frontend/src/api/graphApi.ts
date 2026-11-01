import { apiClient } from './client';
import {
  CitationGraphFilters,
  ConceptGraphFilters,
  GraphEdgeDetails,
  GraphNodeDetails,
  GraphResponse,
} from '../types/graph';
import { mockCitationGraph, mockConceptGraph } from '../mocks/graphMockData';

// Global development flag for toggling mock vs live data
let useMockData = false;

export const setUseMockGraphData = (enable: boolean) => {
  useMockData = enable;
};

export const getUseMockGraphData = () => useMockData;

export const graphApi = {
  getCitationGraph: async (filters: CitationGraphFilters = {}): Promise<GraphResponse> => {
    if (useMockData) {
      // Simulate network latency for realistic feel
      await new Promise((r) => setTimeout(r, 250));
      return filterMockCitationGraph(filters);
    }

    try {
      const params = new URLSearchParams();
      if (filters.collectionId) params.append('collectionId', filters.collectionId);
      if (filters.paperId) params.append('paperId', filters.paperId);
      if (filters.yearFrom) params.append('yearFrom', String(filters.yearFrom));
      if (filters.yearTo) params.append('yearTo', String(filters.yearTo));
      if (filters.author) params.append('author', filters.author);
      if (filters.citationDepth) params.append('depth', String(filters.citationDepth));
      if (filters.query) params.append('query', filters.query);
      if (filters.limit) params.append('limit', String(filters.limit));

      const res = await apiClient.get<GraphResponse>(`/graphs/citations?${params.toString()}`);
      return res.data;
    } catch (err) {
      // If backend fails or returns empty in dev, fallback gracefully to mock with notice
      console.warn('Backend citation graph API returned an error, falling back to mock dataset:', err);
      return filterMockCitationGraph(filters);
    }
  },

  getCitationNeighborhood: async (paperId: string, depth = 1): Promise<GraphResponse> => {
    if (useMockData) {
      return filterMockCitationGraph({ paperId, citationDepth: depth });
    }
    try {
      const res = await apiClient.get<GraphResponse>(`/graphs/citations/${encodeURIComponent(paperId)}/neighborhood?depth=${depth}`);
      return res.data;
    } catch (err) {
      return filterMockCitationGraph({ paperId, citationDepth: depth });
    }
  },

  getConceptGraph: async (filters: ConceptGraphFilters = {}): Promise<GraphResponse> => {
    if (useMockData) {
      await new Promise((r) => setTimeout(r, 250));
      return filterMockConceptGraph(filters);
    }

    try {
      const params = new URLSearchParams();
      if (filters.collectionId) params.append('collectionId', filters.collectionId);
      if (filters.paperId) params.append('paperId', filters.paperId);
      if (filters.claimId) params.append('claimId', filters.claimId);
      if (filters.query) params.append('query', filters.query);
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.nodeTypes && filters.nodeTypes.length > 0) {
        params.append('nodeTypes', filters.nodeTypes.join(','));
      }
      if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
        params.append('relationshipTypes', filters.relationshipTypes.join(','));
      }
      if (filters.provenanceTypes && filters.provenanceTypes.length > 0) {
        params.append('provenanceTypes', filters.provenanceTypes.join(','));
      }
      if (filters.reviewStatus && filters.reviewStatus.length > 0) {
        params.append('reviewStatus', filters.reviewStatus.join(','));
      }

      const res = await apiClient.get<GraphResponse>(`/graphs/concepts?${params.toString()}`);
      return res.data;
    } catch (err) {
      console.warn('Backend concept graph API returned an error, falling back to mock dataset:', err);
      return filterMockConceptGraph(filters);
    }
  },

  getClaimNeighborhood: async (claimId: string): Promise<GraphResponse> => {
    if (useMockData) {
      return filterMockConceptGraph({ claimId });
    }
    try {
      const res = await apiClient.get<GraphResponse>(`/graphs/claims/${encodeURIComponent(claimId)}/neighborhood`);
      return res.data;
    } catch (err) {
      return filterMockConceptGraph({ claimId });
    }
  },

  getNodeDetails: async (nodeId: string): Promise<GraphNodeDetails | null> => {
    try {
      const res = await apiClient.get<GraphNodeDetails>(`/graphs/nodes/${encodeURIComponent(nodeId)}`);
      return res.data;
    } catch {
      return null;
    }
  },

  getEdgeDetails: async (edgeId: string): Promise<GraphEdgeDetails | null> => {
    try {
      const res = await apiClient.get<GraphEdgeDetails>(`/graphs/edges/${encodeURIComponent(edgeId)}`);
      return res.data;
    } catch {
      return null;
    }
  },
};

function filterMockCitationGraph(filters: CitationGraphFilters): GraphResponse {
  let nodes = [...mockCitationGraph.nodes];
  let edges = [...mockCitationGraph.edges];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    nodes = nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.data.authors && String(n.data.authors).toLowerCase().includes(q)) ||
        (n.data.doi && n.data.doi.toLowerCase().includes(q))
    );
  }

  if (filters.yearFrom) {
    nodes = nodes.filter((n) => typeof n.data.year === 'number' && n.data.year >= filters.yearFrom!);
  }

  if (filters.yearTo) {
    nodes = nodes.filter((n) => typeof n.data.year === 'number' && n.data.year <= filters.yearTo!);
  }

  if (filters.importedOnly) {
    nodes = nodes.filter((n) => n.data.isImported === true);
  }

  const validIds = new Set(nodes.map((n) => n.id));
  edges = edges.filter((e) => validIds.has(e.source) && validIds.has(e.target));

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      isTruncated: false,
      appliedFilters: filters,
    },
  };
}

function filterMockConceptGraph(filters: ConceptGraphFilters): GraphResponse {
  let nodes = [...mockConceptGraph.nodes];
  let edges = [...mockConceptGraph.edges];

  // If evidence chunks shouldn't be shown by default:
  if (!filters.showEvidenceChunks) {
    nodes = nodes.filter((n) => n.type !== 'CHUNK');
  }

  if (filters.nodeTypes && filters.nodeTypes.length > 0) {
    nodes = nodes.filter((n) => filters.nodeTypes!.includes(n.type));
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    nodes = nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        (n.data.title && n.data.title.toLowerCase().includes(q)) ||
        (n.data.normalizedText && n.data.normalizedText.toLowerCase().includes(q))
    );
  }

  const validNodeIds = new Set(nodes.map((n) => n.id));
  edges = edges.filter((e) => validNodeIds.has(e.source) && validNodeIds.has(e.target));

  if (filters.relationshipTypes && filters.relationshipTypes.length > 0) {
    edges = edges.filter((e) => filters.relationshipTypes!.includes(e.type));
  }

  if (filters.provenanceTypes && filters.provenanceTypes.length > 0) {
    edges = edges.filter((e) => e.data.provenance && filters.provenanceTypes!.includes(e.data.provenance));
  }

  if (filters.reviewStatus && filters.reviewStatus.length > 0) {
    edges = edges.filter((e) => e.data.reviewStatus && filters.reviewStatus!.includes(e.data.reviewStatus));
  }

  return {
    nodes,
    edges,
    metadata: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      isTruncated: false,
      appliedFilters: filters,
    },
  };
}
