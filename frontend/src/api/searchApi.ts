import { apiClient } from './client';
import { SearchResult } from '../types';

export interface SearchParams {
  query: string;
  searchMode?: 'HYBRID' | 'SEMANTIC' | 'LEXICAL';
  semanticWeight?: number;
  yearFrom?: number;
  yearTo?: number;
  author?: string;
  venue?: string;
  collectionId?: string;
  topK?: number;
}

export const searchApi = {
  search: async (params: SearchParams): Promise<SearchResult[]> => {
    const res = await apiClient.post<SearchResult[]>('/search', params);
    return res.data;
  }
};
