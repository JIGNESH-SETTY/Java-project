import { apiClient } from './client';
import { Claim, ClaimDetail, ClaimRelation, ClaimType, RelationType, ReviewStatus } from '../types';

export const claimApi = {
  listClaims: async (page = 0, size = 50): Promise<Claim[]> => {
    const res = await apiClient.get<Claim[]>('/claims', { params: { page, size } });
    return res.data;
  },

  getClaimDetail: async (id: string): Promise<ClaimDetail> => {
    const res = await apiClient.get<ClaimDetail>(`/claims/${id}`);
    return res.data;
  },

  createClaim: async (data: {
    paperId?: string;
    sourceChunkId?: string;
    normalizedText: string;
    sourceText: string;
    claimType: ClaimType;
    sectionName?: string;
    pageNumber?: number;
  }): Promise<Claim> => {
    const res = await apiClient.post<Claim>('/claims', data);
    return res.data;
  },

  updateClaim: async (id: string, data: Partial<Claim>): Promise<Claim> => {
    const res = await apiClient.patch<Claim>(`/claims/${id}`, data);
    return res.data;
  },

  createRelation: async (sourceClaimId: string, data: {
    targetClaimId: string;
    relationType: RelationType;
    confidence?: number;
    rationale: string;
    evidenceChunkIds?: string[];
  }): Promise<ClaimRelation> => {
    const res = await apiClient.post<ClaimRelation>(`/claims/${sourceClaimId}/relations`, data);
    return res.data;
  },

  listRelations: async (): Promise<ClaimRelation[]> => {
    const res = await apiClient.get<ClaimRelation[]>('/claim-relations');
    return res.data;
  },

  updateReviewStatus: async (relationId: string, reviewStatus: ReviewStatus): Promise<void> => {
    await apiClient.patch(`/claim-relations/${relationId}/review-status`, { reviewStatus });
  }
};
