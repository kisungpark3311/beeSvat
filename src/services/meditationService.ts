import axios from 'axios';
import type {
  MeditationDetail,
  MeditationListItem,
  GenerateMeditationResponse,
} from '@contracts/meditation.contract';
import type { PaginationMeta } from '@contracts/types';

// FEAT-3: Meditation API service

const api = axios.create({
  baseURL: '/api/v1/meditations',
  headers: { 'Content-Type': 'application/json' },
});

export async function createMeditation(
  accessToken: string | null,
  data: { analysisId?: string; content: string },
) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await api.post<{ data: MeditationDetail }>('/', data, { headers });
  return res.data;
}

export async function listMeditations(accessToken: string | null, page?: number, limit?: number) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await api.get<{
    data: { items: MeditationListItem[]; meta: PaginationMeta };
  }>('/', {
    headers,
    params: { page, limit },
  });
  return { data: res.data.items, meta: res.data.meta };
}

export async function getMeditation(accessToken: string, id: string) {
  const { data: res } = await api.get<{ data: MeditationDetail }>(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function updateMeditation(accessToken: string, id: string, content: string) {
  const { data: res } = await api.put<{ data: MeditationDetail }>(
    `/${id}`,
    { content },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
}

export async function deleteMeditation(accessToken: string, id: string) {
  await api.delete(`/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function generateMeditation(accessToken: string, analysisId: string) {
  const { data: res } = await api.post<{ data: GenerateMeditationResponse }>(
    '/generate',
    { analysisId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
}
