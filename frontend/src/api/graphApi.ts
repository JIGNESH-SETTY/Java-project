import { apiClient } from './client';
import { GraphResponse } from '../types';

export const graphApi = {
  getCitationGraph: async (): Promise<GraphResponse> => {
    const res = await apiClient.get<GraphResponse>('/graphs/citations');
    return res.data;
  },

  getConceptGraph: async (): Promise<GraphResponse> => {
    const res = await apiClient.get<GraphResponse>('/graphs/concepts');
    return res.data;
  }
};
