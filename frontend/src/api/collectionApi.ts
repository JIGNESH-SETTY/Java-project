import { apiClient } from './client';
import { Collection } from '../types';

export const collectionApi = {
  listCollections: async (): Promise<Collection[]> => {
    const res = await apiClient.get<Collection[]>('/collections');
    return res.data;
  },

  getCollection: async (id: string): Promise<Collection> => {
    const res = await apiClient.get<Collection>(`/collections/${id}`);
    return res.data;
  },

  createCollection: async (data: { name: string; description?: string }): Promise<Collection> => {
    const res = await apiClient.post<Collection>('/collections', data);
    return res.data;
  },

  updateCollection: async (id: string, data: { name?: string; description?: string }): Promise<Collection> => {
    const res = await apiClient.patch<Collection>(`/collections/${id}`, data);
    return res.data;
  },

  deleteCollection: async (id: string): Promise<void> => {
    await apiClient.delete(`/collections/${id}`);
  },

  addPaper: async (collectionId: string, paperId: string): Promise<void> => {
    await apiClient.post(`/collections/${collectionId}/papers/${paperId}`);
  },

  removePaper: async (collectionId: string, paperId: string): Promise<void> => {
    await apiClient.delete(`/collections/${collectionId}/papers/${paperId}`);
  }
};
