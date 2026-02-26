// IMPORTANT: Import prismaMock BEFORE analysis.service to activate the mock
import { getMockPrisma } from '@/__tests__/utils/prismaMock';
import type { MockPrismaClient } from '@/__tests__/utils/prismaMock';
import { createTestAnalysis } from '@/__tests__/utils/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';

// FEAT-1: Analysis service unit tests

import {
  createAnalysis,
  getAnalysis,
  listAnalyses,
  rateAnalysis,
} from '@/server/services/analysis.service';
import { AuthError } from '@/server/middleware/auth.middleware';

describe('AnalysisService', () => {
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    mockPrisma = getMockPrisma();
  });

  // =========================================
  // createAnalysis
  // =========================================
  describe('분석 요청 생성 (createAnalysis)', () => {
    const createData = {
      book: '요한복음',
      chapter: 3,
      verseStart: 16,
      verseEnd: 16,
      passageText: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니',
    };

    it('성공적으로 분석 요청을 생성한다 (status: pending)', async () => {
      const createdAnalysis = createTestAnalysis({
        status: 'pending',
        ...createData,
      });

      mockPrisma.analysis.create.mockResolvedValue(createdAnalysis);

      const result = await createAnalysis('test-user-id-1', createData);

      expect(result.id).toBe('test-analysis-id-1');
      expect(result.status).toBe('pending');
      expect(result.createdAt).toEqual(createdAnalysis.createdAt);
      expect(mockPrisma.analysis.create).toHaveBeenCalledWith({
        data: {
          userId: 'test-user-id-1',
          book: createData.book,
          chapter: createData.chapter,
          verseStart: createData.verseStart,
          verseEnd: createData.verseEnd,
          passageText: createData.passageText,
          status: 'pending',
        },
      });
    });
  });

  // =========================================
  // getAnalysis
  // =========================================
  describe('분석 결과 조회 (getAnalysis)', () => {
    it('성공적으로 분석 결과를 조회한다', async () => {
      const analysis = {
        ...createTestAnalysis(),
        result: {
          id: 'test-result-id-1',
          analysisId: 'test-analysis-id-1',
          structure: {},
          explanation: '구문 분석 결과입니다',
          mainVerbs: [],
          modifiers: [],
          connectors: [],
          aiModel: 'gpt-4',
          processingTimeMs: 1500,
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      };

      mockPrisma.analysis.findUnique.mockResolvedValue(analysis);

      const result = await getAnalysis('test-user-id-1', 'test-analysis-id-1');

      expect(result.id).toBe('test-analysis-id-1');
      expect(result.result).toBeDefined();
      expect(result.result?.explanation).toBe('구문 분석 결과입니다');
      expect(mockPrisma.analysis.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-analysis-id-1' },
        include: { result: true },
      });
    });

    it('존재하지 않는 분석 ID 시 404 에러를 던진다', async () => {
      mockPrisma.analysis.findUnique.mockResolvedValue(null);

      await expect(getAnalysis('test-user-id-1', 'non-existing-id')).rejects.toThrow(AuthError);

      try {
        await getAnalysis('test-user-id-1', 'non-existing-id');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('분석 결과를 찾을 수 없습니다');
        expect((e as AuthError).statusCode).toBe(404);
      }
    });

    it('다른 사용자의 분석 조회 시 403 에러를 던진다', async () => {
      const analysis = {
        ...createTestAnalysis({ userId: 'other-user-id' }),
        result: null,
      };

      mockPrisma.analysis.findUnique.mockResolvedValue(analysis);

      await expect(getAnalysis('test-user-id-1', 'test-analysis-id-1')).rejects.toThrow(AuthError);

      try {
        await getAnalysis('test-user-id-1', 'test-analysis-id-1');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('접근 권한이 없습니다');
        expect((e as AuthError).statusCode).toBe(403);
      }
    });
  });

  // =========================================
  // listAnalyses
  // =========================================
  describe('분석 목록 조회 (listAnalyses)', () => {
    it('성공적으로 분석 목록을 페이지네이션으로 반환한다', async () => {
      const analyses = [
        {
          id: 'analysis-1',
          book: '요한복음',
          chapter: 3,
          verseStart: 16,
          verseEnd: 16,
          status: 'completed',
          rating: 5,
          createdAt: new Date('2026-01-02T00:00:00Z'),
        },
        {
          id: 'analysis-2',
          book: '창세기',
          chapter: 1,
          verseStart: 1,
          verseEnd: 3,
          status: 'pending',
          rating: null,
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      ];

      mockPrisma.analysis.findMany.mockResolvedValue(analyses);
      mockPrisma.analysis.count.mockResolvedValue(15);

      const result = await listAnalyses('test-user-id-1', { page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 15,
        totalPages: 2,
      });
      expect(mockPrisma.analysis.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id-1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
        select: {
          id: true,
          book: true,
          chapter: true,
          verseStart: true,
          verseEnd: true,
          status: true,
          rating: true,
          createdAt: true,
        },
      });
      expect(mockPrisma.analysis.count).toHaveBeenCalledWith({
        where: { userId: 'test-user-id-1' },
      });
    });

    it('빈 목록을 반환한다', async () => {
      mockPrisma.analysis.findMany.mockResolvedValue([]);
      mockPrisma.analysis.count.mockResolvedValue(0);

      const result = await listAnalyses('test-user-id-1', { page: 1, limit: 10 });

      expect(result.items).toHaveLength(0);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  // =========================================
  // rateAnalysis
  // =========================================
  describe('분석 만족도 평가 (rateAnalysis)', () => {
    it('성공적으로 만족도를 평가한다', async () => {
      const analysis = createTestAnalysis();

      mockPrisma.analysis.findUnique.mockResolvedValue(analysis);
      mockPrisma.analysis.update.mockResolvedValue({
        ...analysis,
        rating: 5,
      });

      const result = await rateAnalysis('test-user-id-1', 'test-analysis-id-1', 5);

      expect(result.id).toBe('test-analysis-id-1');
      expect(result.rating).toBe(5);
      expect(mockPrisma.analysis.update).toHaveBeenCalledWith({
        where: { id: 'test-analysis-id-1' },
        data: { rating: 5 },
      });
    });

    it('존재하지 않는 분석 ID 시 404 에러를 던진다', async () => {
      mockPrisma.analysis.findUnique.mockResolvedValue(null);

      await expect(rateAnalysis('test-user-id-1', 'non-existing-id', 5)).rejects.toThrow(AuthError);

      try {
        await rateAnalysis('test-user-id-1', 'non-existing-id', 5);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('분석 결과를 찾을 수 없습니다');
        expect((e as AuthError).statusCode).toBe(404);
      }
    });

    it('다른 사용자의 분석 평가 시 403 에러를 던진다', async () => {
      const analysis = createTestAnalysis({ userId: 'other-user-id' });

      mockPrisma.analysis.findUnique.mockResolvedValue(analysis);

      await expect(rateAnalysis('test-user-id-1', 'test-analysis-id-1', 5)).rejects.toThrow(
        AuthError,
      );

      try {
        await rateAnalysis('test-user-id-1', 'test-analysis-id-1', 5);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('접근 권한이 없습니다');
        expect((e as AuthError).statusCode).toBe(403);
      }
    });
  });
});
