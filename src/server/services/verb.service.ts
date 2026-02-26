import { prisma } from '@/lib/prisma';
import { AuthError } from '@/server/middleware/auth.middleware';

// FEAT-2: Verb Analysis service

// Get verb analysis detail for a specific word in an analysis result
export async function getVerbDetail(analysisResultId: string, word: string) {
  const verb = await prisma.verbAnalysis.findFirst({
    where: { analysisResultId, originalWord: word },
  });

  if (!verb) {
    throw new AuthError('동사 분석을 찾을 수 없습니다', 404);
  }

  return {
    id: verb.id,
    originalWord: verb.originalWord,
    transliteration: verb.transliteration,
    rootForm: verb.rootForm,
    language: verb.language,
    grammar: {
      tense: verb.tense,
      voice: verb.voice,
      mood: verb.mood,
      person: verb.person,
      number: verb.number,
      binyan: verb.binyan,
    },
    meaning: verb.meaning,
    position: verb.position,
  };
}

// Get references to the same original word across other analyses
export async function getVerbReferences(word: string, query: { page: number; limit: number }) {
  const { page, limit } = query;

  const [verbs, total] = await Promise.all([
    prisma.verbAnalysis.findMany({
      where: { originalWord: word },
      include: {
        analysisResult: {
          include: {
            analysis: {
              select: { id: true, book: true, chapter: true, verseStart: true, passageText: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.verbAnalysis.count({ where: { originalWord: word } }),
  ]);

  const references = verbs.map((v) => ({
    book: v.analysisResult.analysis.book,
    chapter: v.analysisResult.analysis.chapter,
    verse: v.analysisResult.analysis.verseStart,
    passageText: v.analysisResult.analysis.passageText,
    analysisId: v.analysisResult.analysis.id,
  }));

  return {
    word,
    references,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
