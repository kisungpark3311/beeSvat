import apiClient from '@/lib/apiClient';
import type {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisDetail,
  AnalysisListItem,
  RatingResponse,
} from '@contracts/analysis.contract';
import type { PaginationMeta } from '@contracts/types';

// FEAT-2: Analysis API service

const BASE = '/api/v1/analysis';

export async function createAnalysis(accessToken: string | null, data: CreateAnalysisRequest) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await apiClient.post<{ data: CreateAnalysisResponse }>(BASE, data, {
    headers,
  });
  return res.data;
}

export async function getAnalysis(accessToken: string | null, id: string) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await apiClient.get<{ data: AnalysisDetail }>(`${BASE}/${id}`, { headers });
  return res.data;
}

export async function listAnalyses(accessToken: string | null, page?: number, limit?: number) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await apiClient.get<{
    data: { items: AnalysisListItem[]; meta: PaginationMeta };
  }>(BASE, { headers, params: { page, limit } });
  return res.data;
}

export async function rateAnalysis(accessToken: string, id: string, rating: number) {
  const { data: res } = await apiClient.patch<{ data: RatingResponse }>(
    `${BASE}/${id}/rating`,
    { rating },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
}
