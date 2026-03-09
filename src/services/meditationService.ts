import apiClient from '@/lib/apiClient';
import type {
  MeditationDetail,
  MeditationListItem,
  GenerateMeditationResponse,
} from '@contracts/meditation.contract';
import type { PaginationMeta } from '@contracts/types';

// FEAT-3: Meditation API service

const BASE = '/api/v1/meditations';

export async function createMeditation(
  accessToken: string | null,
  data: { analysisId?: string; content: string },
) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await apiClient.post<{ data: MeditationDetail }>(BASE, data, { headers });
  return res.data;
}

export async function listMeditations(accessToken: string | null, page?: number, limit?: number) {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const { data: res } = await apiClient.get<{
    data: { items: MeditationListItem[]; meta: PaginationMeta };
  }>(BASE, {
    headers,
    params: { page, limit },
  });
  return { data: res.data.items, meta: res.data.meta };
}

export async function getMeditation(accessToken: string, id: string) {
  const { data: res } = await apiClient.get<{ data: MeditationDetail }>(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function updateMeditation(accessToken: string, id: string, content: string) {
  const { data: res } = await apiClient.put<{ data: MeditationDetail }>(
    `${BASE}/${id}`,
    { content },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
}

export async function deleteMeditation(accessToken: string, id: string) {
  await apiClient.delete(`${BASE}/${id}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function generateMeditation(accessToken: string, analysisId: string) {
  const { data: res } = await apiClient.post<{ data: GenerateMeditationResponse }>(
    `${BASE}/generate`,
    { analysisId },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  return res.data;
}
