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

export async function createAnalysis(accessToken: string, data: CreateAnalysisRequest) {
  const { data: res } = await api.post<{ data: CreateAnalysisResponse }>('/', data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function getAnalysis(accessToken: string, id: string) {
  const { data: res } = await api.get<{ data: AnalysisDetail }>(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function listAnalyses(accessToken: string, page?: number, limit?: number) {
  const { data: res } = await api.get<{ data: AnalysisListItem[]; meta: PaginationMeta }>('/', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { page, limit },
  });
  return res;
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
