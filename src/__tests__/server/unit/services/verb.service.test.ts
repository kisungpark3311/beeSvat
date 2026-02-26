// IMPORTANT: Import prismaMock BEFORE verb.service to activate the mock
import { getMockPrisma } from '@/__tests__/utils/prismaMock';
import type { MockPrismaClient } from '@/__tests__/utils/prismaMock';
import { describe, it, expect, beforeEach } from 'vitest';

// FEAT-2: Verb Analysis service unit tests

import { getVerbDetail, getVerbReferences } from '@/server/services/verb.service';
import { AuthError } from '@/server/middleware/auth.middleware';

describe('VerbService', () => {
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    mockPrisma = getMockPrisma();
  });

  // =========================================
  // getVerbDetail
  // =========================================
  describe('동사 상세 분석 조회 (getVerbDetail)', () => {
    const mockVerb = {
      id: 'test-verb-id-1',
      analysisResultId: 'test-result-id-1',
      originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
      transliteration: 'egapesen',
      rootForm: '\u03B1\u03B3\u03B1\u03C0\u03B1\u03C9',
      language: 'greek',
      tense: 'Aorist',
      voice: 'Active',
      mood: 'Indicative',
      person: '3rd',
      number: 'Singular',
      binyan: null,
      meaning: '사랑하다',
      position: 3,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    it('성공적으로 동사 상세 분석을 반환한다', async () => {
      mockPrisma.verbAnalysis.findFirst.mockResolvedValue(mockVerb);

      const result = await getVerbDetail(
        'test-result-id-1',
        '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
      );

      expect(result.id).toBe('test-verb-id-1');
      expect(result.originalWord).toBe('\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD');
      expect(result.transliteration).toBe('egapesen');
      expect(result.rootForm).toBe('\u03B1\u03B3\u03B1\u03C0\u03B1\u03C9');
      expect(result.language).toBe('greek');
      expect(result.grammar).toEqual({
        tense: 'Aorist',
        voice: 'Active',
        mood: 'Indicative',
        person: '3rd',
        number: 'Singular',
        binyan: null,
      });
      expect(result.meaning).toBe('사랑하다');
      expect(result.position).toBe(3);
      expect(mockPrisma.verbAnalysis.findFirst).toHaveBeenCalledWith({
        where: {
          analysisResultId: 'test-result-id-1',
          originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
        },
      });
    });

    it('존재하지 않는 동사 시 404 에러를 던진다', async () => {
      mockPrisma.verbAnalysis.findFirst.mockResolvedValue(null);

      await expect(getVerbDetail('test-result-id-1', 'nonexistent')).rejects.toThrow(AuthError);

      try {
        await getVerbDetail('test-result-id-1', 'nonexistent');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('동사 분석을 찾을 수 없습니다');
        expect((e as AuthError).statusCode).toBe(404);
      }
    });
  });

  // =========================================
  // getVerbReferences
  // =========================================
  describe('동사 참조 구절 조회 (getVerbReferences)', () => {
    it('성공적으로 참조 구절 목록을 반환한다', async () => {
      const mockVerbs = [
        {
          id: 'verb-1',
          originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
          createdAt: new Date('2026-01-02T00:00:00Z'),
          analysisResult: {
            analysis: {
              id: 'analysis-1',
              book: '요한복음',
              chapter: 3,
              verseStart: 16,
              passageText: '하나님이 세상을 이처럼 사랑하사',
            },
          },
        },
        {
          id: 'verb-2',
          originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
          createdAt: new Date('2026-01-01T00:00:00Z'),
          analysisResult: {
            analysis: {
              id: 'analysis-2',
              book: '로마서',
              chapter: 5,
              verseStart: 8,
              passageText: '우리가 아직 죄인 되었을 때에',
            },
          },
        },
      ];

      mockPrisma.verbAnalysis.findMany.mockResolvedValue(mockVerbs);
      mockPrisma.verbAnalysis.count.mockResolvedValue(12);

      const result = await getVerbReferences('\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD', {
        page: 1,
        limit: 5,
      });

      expect(result.word).toBe('\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD');
      expect(result.references).toHaveLength(2);
      expect(result.references[0]).toEqual({
        book: '요한복음',
        chapter: 3,
        verse: 16,
        passageText: '하나님이 세상을 이처럼 사랑하사',
        analysisId: 'analysis-1',
      });
      expect(result.references[1]).toEqual({
        book: '로마서',
        chapter: 5,
        verse: 8,
        passageText: '우리가 아직 죄인 되었을 때에',
        analysisId: 'analysis-2',
      });
      expect(result.meta).toEqual({
        page: 1,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
      expect(mockPrisma.verbAnalysis.findMany).toHaveBeenCalledWith({
        where: { originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD' },
        include: {
          analysisResult: {
            include: {
              analysis: {
                select: {
                  id: true,
                  book: true,
                  chapter: true,
                  verseStart: true,
                  passageText: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 5,
      });
      expect(mockPrisma.verbAnalysis.count).toHaveBeenCalledWith({
        where: { originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD' },
      });
    });

    it('빈 참조 목록을 반환한다', async () => {
      mockPrisma.verbAnalysis.findMany.mockResolvedValue([]);
      mockPrisma.verbAnalysis.count.mockResolvedValue(0);

      const result = await getVerbReferences('nonexistent', { page: 1, limit: 5 });

      expect(result.word).toBe('nonexistent');
      expect(result.references).toHaveLength(0);
      expect(result.meta).toEqual({
        page: 1,
        limit: 5,
        total: 0,
        totalPages: 0,
      });
    });
  });
});
