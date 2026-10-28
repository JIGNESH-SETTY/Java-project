import { apiClient } from './client';
import { Paper, PaperDetail, PaperSummary, DocumentChunk, Claim, IngestionJob } from '../types';

export const paperApi = {
  uploadPaper: async (file: File, visibility: 'PRIVATE' | 'PUBLIC' = 'PRIVATE') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('visibility', visibility);

    const res = await apiClient.post<{ paper: Paper; job: IngestionJob }>('/papers/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  createManual: async (data: {
    title: string;
    abstractText?: string;
    doi?: string;
    publicationYear?: number;
    venue?: string;
    authors?: string[];
    visibility?: 'PRIVATE' | 'PUBLIC';
  }): Promise<Paper> => {
    const res = await apiClient.post<Paper>('/papers/manual', data);
    return res.data;
  },

  listPapers: async (page = 0, size = 50): Promise<PaperSummary[]> => {
    const res = await apiClient.get<PaperSummary[]>('/papers', { params: { page, size } });
    return res.data;
  },

  getPaperDetail: async (id: string): Promise<PaperDetail> => {
    const res = await apiClient.get<PaperDetail>(`/papers/${id}`);
    return res.data;
  },

  getPaperChunks: async (id: string): Promise<DocumentChunk[]> => {
    const res = await apiClient.get<DocumentChunk[]>(`/papers/${id}/chunks`);
    return res.data;
  },

  getPaperClaims: async (id: string): Promise<Claim[]> => {
    const res = await apiClient.get<Claim[]>(`/papers/${id}/claims`);
    return res.data;
  },

  getIngestionStatus: async (id: string): Promise<IngestionJob> => {
    const res = await apiClient.get<IngestionJob>(`/papers/${id}/ingestion-status`);
    return res.data;
  },

  deletePaper: async (id: string): Promise<void> => {
    await apiClient.delete(`/papers/${id}`);
  }
};
