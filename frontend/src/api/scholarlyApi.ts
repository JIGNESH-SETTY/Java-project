import { apiClient } from './client';
import {
  SourceSearchResult,
  PaperMetadata,
  ScholarlyImportRequest,
  ScholarlyImportResult,
  PaperExternalIdentifier,
  PaperAccessLink,
} from '../types';

export const scholarlyApi = {
  getProviders: async (): Promise<string[]> => {
    const res = await apiClient.get<string[]>('/scholarly/providers');
    return res.data;
  },

  searchSources: async (params: {
    query: string;
    provider?: string;
    limit?: number;
    yearFrom?: number;
    yearTo?: number;
    openAccessOnly?: boolean;
  }): Promise<SourceSearchResult[]> => {
    const res = await apiClient.get<SourceSearchResult[]>('/scholarly/search', {
      params,
    });
    return res.data;
  },

  resolveDoi: async (doi: string): Promise<PaperMetadata> => {
    const res = await apiClient.get<PaperMetadata>('/scholarly/resolve/doi', {
      params: { doi },
    });
    return res.data;
  },

  resolveExternal: async (provider: string, externalId: string): Promise<PaperMetadata> => {
    const res = await apiClient.get<PaperMetadata>('/scholarly/resolve/external', {
      params: { provider, externalId },
    });
    return res.data;
  },

  importPaper: async (request: ScholarlyImportRequest): Promise<ScholarlyImportResult> => {
    const res = await apiClient.post<ScholarlyImportResult>('/scholarly/import', request);
    return res.data;
  },

  getExternalIds: async (paperId: string): Promise<PaperExternalIdentifier[]> => {
    const res = await apiClient.get<PaperExternalIdentifier[]>(`/scholarly/papers/${paperId}/external-ids`);
    return res.data;
  },

  getAccessLinks: async (paperId: string): Promise<PaperAccessLink[]> => {
    const res = await apiClient.get<PaperAccessLink[]>(`/scholarly/papers/${paperId}/access-links`);
    return res.data;
  },
};
