import { z } from 'zod';

// FEAT-4: Bible Text API Contract

// === Request Schemas ===

export const bibleVerseRequestSchema = z.object({
  book: z.string().min(1),
  chapter: z.coerce.number().int().positive(),
  verseStart: z.coerce.number().int().positive(),
  verseEnd: z.coerce.number().int().positive().optional(),
});

export const bibleSearchSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(10),
});

// === Response Types ===

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

export interface BibleSearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  matchHighlight: string;
}

export interface BibleSearchResponse {
  query: string;
  results: BibleSearchResult[];
  meta: { page: number; limit: number; total: number; totalPages: number };
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

// === Inferred Types ===

export type BibleVerseRequest = z.infer<typeof bibleVerseRequestSchema>;
export type BibleSearchRequest = z.infer<typeof bibleSearchSchema>;
