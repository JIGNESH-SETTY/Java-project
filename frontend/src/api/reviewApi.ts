import { apiClient } from './client';
import { ReviewDetail, ReviewEvidenceItem, ReviewSummary } from '../types';

export const reviewApi = {
  generateReview: async (data: {
    query: string;
    paperIds?: string[];
    collectionId?: string;
    scope?: string;
    customOutline?: string;
  }): Promise<ReviewDetail> => {
    const res = await apiClient.post<ReviewDetail>('/reviews/generate', data);
    return res.data;
  },

  listReviews: async (): Promise<ReviewSummary[]> => {
    const res = await apiClient.get<ReviewSummary[]>('/reviews');
    return res.data;
  },

  getReviewDetail: async (id: string): Promise<ReviewDetail> => {
    const res = await apiClient.get<ReviewDetail>(`/reviews/${id}`);
    return res.data;
  },

  getReviewEvidence: async (id: string): Promise<ReviewEvidenceItem[]> => {
    const res = await apiClient.get<ReviewEvidenceItem[]>(`/reviews/${id}/evidence`);
    return res.data;
  },

  exportReview: async (id: string, format: 'markdown' | 'bibtex' = 'markdown'): Promise<string> => {
    const res = await apiClient.get<string>(`/reviews/${id}/export`, {
      params: { format },
      responseType: 'text',
    });
    return res.data;
  }
};
