import axios from 'axios';
import type {
  CreateAnalysisRequest,
  CreateAnalysisResponse,
  AnalysisDetail,
  AnalysisListItem,
  RatingResponse,
} from '@contracts/analysis.contract';
import type { PaginationMeta } from '@contracts/types';

// FEAT-2: Analysis API service

const api = axios.create({
  baseURL: '/api/v1/analysis',
  headers: { 'Content-Type': 'application/json' },
});

export async function createAnalysis(accessToken: string | null, data: CreateAnalysisRequest) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await api.post<{ data: CreateAnalysisResponse }>('/', data, { headers });
  return res.data;
}

export async function getAnalysis(accessToken: string | null, id: string) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await api.get<{ data: AnalysisDetail }>(`/${id}`, { headers });
  return res.data;
}

export async function listAnalyses(accessToken: string | null, page?: number, limit?: number) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await api.get<{
    data: { items: AnalysisListItem[]; meta: PaginationMeta };
  }>('/', { headers, params: { page, limit } });
  return res.data;
}

export async function rateAnalysis(accessToken: string, id: string, rating: number) {
  const { data: res } = await api.patch<{ data: RatingResponse }>(
    `/${id}/rating`,
    { rating },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
}
