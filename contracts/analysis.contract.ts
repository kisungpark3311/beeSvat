import { z } from 'zod';

// FEAT-1: Syntax Analysis API Contract

// === Request Schemas ===

export const createAnalysisRequestSchema = z
  .object({
    book: z.string().min(1, '성경 책명을 입력해주세요'),
    chapter: z.number().int().positive('장은 1 이상이어야 합니다'),
    verseStart: z.number().int().positive('시작 절은 1 이상이어야 합니다'),
    verseEnd: z.number().int().positive('끝 절은 1 이상이어야 합니다'),
    passageText: z.string().min(1, '본문 텍스트를 입력해주세요'),
  })
  .refine((data) => data.verseEnd >= data.verseStart, {
    message: '끝 절은 시작 절보다 크거나 같아야 합니다',
    path: ['verseEnd'],
  });

export const analysisQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export const ratingRequestSchema = z.object({
  rating: z.number().int().min(1, '최소 1점입니다').max(5, '최대 5점입니다'),
});

// === JSONB Structure Types (FEAT-1: Analysis Result) ===

// BibleWorks 스타일 동사 파싱 (svat-skill 기반)
export interface VerbParsing {
  mood: string; // 법: 직설법/명령법/가정법/부정사/분사
  tense: string; // 시상: 현재/미완료/완료/미래 (헬라어) | 완전형/불완전형/명령형 (히브리어)
  voice: string; // 태: 능동태/수동태/중간태
  personNumber: string; // 인칭/수: 3인칭 단수 등
  specialForm?: string; // 특수 형태 (필요시)
}

export interface MainVerb {
  word: string;
  position: number;
  meaning: string;
  original: string; // 원어 (히브리어/헬라어)
  transliteration?: string; // 음역
  parsing?: VerbParsing; // BibleWorks 파싱 테이블
  theologicalImplication?: string; // 신학적 함의
}

export interface Modifier {
  word: string;
  type: string;
  target: string;
  position: number;
}

export interface Connector {
  word: string;
  type: string;
  connects: [string, string];
  position: number;
}

export interface AnalysisStructure {
  original: string;
  parsed: string[];
  hierarchy: Record<string, unknown>;
}

// 관찰/해석/적용 확장 (svat-skill 8단계 프로세스)
export interface AnalysisObservation {
  structureFlow: string; // 본문 구성과 주동사 흐름
  keywords: { word: string; count: number; meaning: string }[];
  context: string; // 선행/후행 문맥
  parallelPassages: string[]; // 평행 구절
}

export interface AnalysisInterpretation {
  theologicalMessage: string; // 핵심 신학적 메시지
  historicalBackground: string; // 역사적/문화적 배경
  redemptiveHistory: string; // 구속사 관점 (그리스도/성령 연결)
}

export interface AnalysisApplication {
  principles: string[]; // 시대 초월적 영적 원리
  personalApplication: string; // 개인 신앙 적용
  pastoralPoints: string[]; // 목회/설교 포인트 (3개)
}

// === Response Types ===

export interface CreateAnalysisResponse {
  id: string;
  status: string;
  createdAt: string;
}

export interface AnalysisResultData {
  id: string;
  structure: AnalysisStructure;
  explanation: string;
  mainVerbs: MainVerb[];
  modifiers: Modifier[];
  connectors: Connector[];
  observation?: AnalysisObservation;
  interpretation?: AnalysisInterpretation;
  application?: AnalysisApplication;
  aiModel: string;
  processingTimeMs: number;
  createdAt: string;
}

export interface AnalysisDetail {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  passageText: string;
  status: string;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
  result: AnalysisResultData | null;
}

export interface AnalysisListItem {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  status: string;
  rating: number | null;
  createdAt: string;
}

export interface RatingResponse {
  id: string;
  rating: number;
}

// === Inferred Request Types ===

export type CreateAnalysisRequest = z.infer<typeof createAnalysisRequestSchema>;
export type AnalysisQuery = z.infer<typeof analysisQuerySchema>;
export type RatingRequest = z.infer<typeof ratingRequestSchema>;
