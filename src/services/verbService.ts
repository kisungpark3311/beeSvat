import axios from 'axios';
import type { VerbDetailResponse, VerbReferencesResponse } from '@contracts/verb.contract';

// FEAT-2: Verb detail API service

const api = axios.create({
  baseURL: '/api/v1/verbs',
  headers: { 'Content-Type': 'application/json' },
});

export async function getVerbDetail(accessToken: string, word: string, analysisResultId: string) {
  const { data } = await api.get<{ data: VerbDetailResponse }>(`/${encodeURIComponent(word)}`, {
    params: { analysisResultId },
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data.data;
}

export async function getVerbReferences(
  accessToken: string,
  word: string,
  page?: number,
  limit?: number,
) {
  const { data } = await api.get<{ data: VerbReferencesResponse }>(
    `/${encodeURIComponent(word)}/references`,
    {
      params: { page, limit },
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return data.data;
}
