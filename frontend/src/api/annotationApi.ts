import { apiClient } from './client';
import { Annotation } from '../types';

export const annotationApi = {
  listAnnotations: async (params?: { paperId?: string; claimId?: string }): Promise<Annotation[]> => {
    const res = await apiClient.get<Annotation[]>('/annotations', { params });
    return res.data;
  },

  createAnnotation: async (data: {
    paperId?: string;
    chunkId?: string;
    claimId?: string;
    body: string;
    annotationType?: string;
  }): Promise<Annotation> => {
    const res = await apiClient.post<Annotation>('/annotations', data);
    return res.data;
  },

  updateAnnotation: async (id: string, body: string): Promise<Annotation> => {
    const res = await apiClient.patch<Annotation>(`/annotations/${id}`, { body });
    return res.data;
  },

  deleteAnnotation: async (id: string): Promise<void> => {
    await apiClient.delete(`/annotations/${id}`);
  }
};
