import { z } from 'zod';

// FEAT-2: Verb Analysis API Contract

// === Request Schemas ===
export const verbDetailRequestSchema = z.object({
  word: z.string().min(1, '원어 단어를 입력해주세요'),
  analysisResultId: z.string().uuid(),
});

export const verbReferencesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(20).default(5),
});

// === Response Types ===
export interface VerbDetailResponse {
  id: string;
  originalWord: string;
  transliteration: string;
  rootForm: string;
  language: 'hebrew' | 'greek';
  grammar: {
    tense: string | null; // 시제 (e.g., Aorist, Perfect)
    voice: string | null; // 태 (e.g., Active, Passive)
    mood: string | null; // 법 (e.g., Indicative, Subjunctive)
    person: string | null; // 인칭 (e.g., 3rd)
    number: string | null; // 수 (e.g., Singular, Plural)
    binyan: string | null; // 빈얀 - Hebrew only (e.g., Qal, Niphal, Piel)
  };
  meaning: string;
  position: number;
}

export interface VerbReferenceItem {
  book: string;
  chapter: number;
  verse: number;
  passageText: string;
  analysisId: string;
}

export interface VerbReferencesResponse {
  word: string;
  references: VerbReferenceItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// === Inferred Request Types ===
export type VerbDetailRequest = z.infer<typeof verbDetailRequestSchema>;
export type VerbReferencesQuery = z.infer<typeof verbReferencesQuerySchema>;
