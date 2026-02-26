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
  accessToken: string,
  data: { analysisId?: string; content: string },
) {
  const { data: res } = await api.post<{ data: MeditationDetail }>('/', data, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.data;
}

export async function listMeditations(accessToken: string, page?: number, limit?: number) {
  const { data: res } = await api.get<{ data: MeditationListItem[]; meta: PaginationMeta }>('/', {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { page, limit },
  });
  return res;
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
