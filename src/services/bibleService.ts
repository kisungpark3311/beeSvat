import axios from 'axios';

// FEAT-5.2: Bible API service

// Types defined inline (bible.contract.ts may be created by parallel agent T5.1)
export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BiblePassageResponse {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  verses: BibleVerse[];
  fullText: string;
}

export interface TodayQTResponse {
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  title: string;
  fullText: string;
  date: string;
}

const api = axios.create({
  baseURL: '/api/v1/bible',
  headers: { 'Content-Type': 'application/json' },
});

export async function getPassage(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number,
) {
  const params: Record<string, string | number> = { verseStart };
  if (verseEnd) params.verseEnd = verseEnd;
  const { data } = await api.get<{ data: BiblePassageResponse }>(
    `/${encodeURIComponent(book)}/${chapter}`,
    { params },
  );
  return data.data;
}

export async function searchVerses(query: string, page?: number, limit?: number) {
  const { data } = await api.get('/search', { params: { query, page, limit } });
  return data.data;
}

export async function getTodayQT() {
  const { data } = await api.get<{ data: TodayQTResponse }>('/today');
  return data.data;
}
