import { prisma } from '@/lib/prisma';
import { AuthError } from '@/server/middleware/auth.middleware';
import { analyzePassage } from '@/server/services/ai.service';
import type { CreateAnalysisRequest } from '@contracts/analysis.contract';

// FEAT-1: Analysis CRUD service

export async function createAnalysis(userId: string | null, data: CreateAnalysisRequest) {
  const analysis = await prisma.analysis.create({
    data: {
      userId,
      book: data.book,
      chapter: data.chapter,
      verseStart: data.verseStart,
      verseEnd: data.verseEnd,
      passageText: data.passageText,
      status: 'pending',
    },
  });

  return {
    id: analysis.id,
    status: analysis.status,
    createdAt: analysis.createdAt,
  };
}

export async function getAnalysis(userId: string | null, analysisId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
    include: { result: true },
  });

  if (!analysis) {
    throw new AuthError('분석 결과를 찾을 수 없습니다', 404);
  }

  // 로그인 사용자는 자기 분석만, 게스트 분석(userId=null)은 누구나 접근 가능
  if (analysis.userId && analysis.userId !== userId) {
    throw new AuthError('접근 권한이 없습니다', 403);
  }

  return analysis;
}

export async function listAnalyses(userId: string | null, query: { page: number; limit: number }) {
  const { page, limit } = query;
  const where = userId ? { userId } : { userId: null };

  const [items, total] = await Promise.all([
    prisma.analysis.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
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
    }),
    prisma.analysis.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// FEAT-1: Process analysis with AI
export async function processAnalysis(analysisId: string) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
  });

  if (!analysis) {
    throw new AuthError('분석 결과를 찾을 수 없습니다', 404);
  }

  try {
    // Remove any existing result (e.g. from a previous failed attempt)
    await prisma.analysisResult.deleteMany({
      where: { analysisId },
    });

    const aiResult = await analyzePassage(
      analysis.passageText,
      analysis.book,
      analysis.chapter,
      analysis.verseStart,
      analysis.verseEnd,
    );

    await prisma.analysisResult.create({
      data: {
        analysisId,
        structure: aiResult.structure as any,
        explanation: aiResult.explanation,
        mainVerbs: aiResult.mainVerbs as any,
        modifiers: aiResult.modifiers as any,
        connectors: aiResult.connectors as any,
        observation: (aiResult.observation ?? null) as any,
        interpretation: (aiResult.interpretation ?? null) as any,
        application: (aiResult.application ?? null) as any,
        theologicalReflection: (aiResult.theologicalReflection ?? null) as any,
        prayerDedication: (aiResult.prayerDedication ?? null) as any,
        aiModel: aiResult.aiModel,
        processingTimeMs: aiResult.processingTimeMs,
      },
    });

    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'completed' },
    });

    return { status: 'completed' };
  } catch (error) {
    await prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'failed' },
    });
    throw error;
  }
}

export async function rateAnalysis(userId: string, analysisId: string, rating: number) {
  const analysis = await prisma.analysis.findUnique({
    where: { id: analysisId },
  });

  if (!analysis) {
    throw new AuthError('분석 결과를 찾을 수 없습니다', 404);
  }

  if (analysis.userId !== userId) {
    throw new AuthError('접근 권한이 없습니다', 403);
  }

  const updated = await prisma.analysis.update({
    where: { id: analysisId },
    data: { rating },
  });

  return {
    id: updated.id,
    rating: updated.rating,
  };
}
