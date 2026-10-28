import { apiClient } from './client';
import { ComparisonResult } from '../types';

export const comparisonApi = {
  comparePapers: async (paperIds: string[]): Promise<ComparisonResult> => {
    const res = await apiClient.post<ComparisonResult>('/compare', { paperIds });
    return res.data;
  }
};
