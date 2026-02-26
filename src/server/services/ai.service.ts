import OpenAI from 'openai';
import { z } from 'zod';
import { aiConfig } from '@/server/config/ai.config';
import { buildAnalysisPrompt } from '@/server/prompts/analysis-v1.prompt';
import type {
  AnalysisStructure,
  MainVerb,
  Modifier,
  Connector,
  AnalysisObservation,
  AnalysisInterpretation,
  AnalysisApplication,
} from '@contracts/analysis.contract';

// FEAT-1: AI syntax analysis service (BibleWorks 스타일 파싱)

// Zod schema for AI response validation
const aiResponseSchema = z.object({
  structure: z.object({
    original: z.string(),
    parsed: z.array(z.string()),
    hierarchy: z.record(z.unknown()),
  }),
  explanation: z.string(),
  mainVerbs: z.array(
    z.object({
      word: z.string(),
      position: z.number(),
      meaning: z.string(),
      original: z.string(),
      transliteration: z.string().optional(),
      parsing: z
        .object({
          mood: z.string(),
          tense: z.string(),
          voice: z.string(),
          personNumber: z.string(),
          specialForm: z.string().optional(),
        })
        .optional(),
      theologicalImplication: z.string().optional(),
    }),
  ),
  modifiers: z.array(
    z.object({
      word: z.string(),
      type: z.string(),
      target: z.string(),
      position: z.number(),
    }),
  ),
  connectors: z.array(
    z.object({
      word: z.string(),
      type: z.string(),
      connects: z.tuple([z.string(), z.string()]),
      position: z.number(),
    }),
  ),
  observation: z
    .object({
      structureFlow: z.string(),
      keywords: z.array(z.object({ word: z.string(), count: z.number(), meaning: z.string() })),
      context: z.string(),
      parallelPassages: z.array(z.string()),
    })
    .optional(),
  interpretation: z
    .object({
      theologicalMessage: z.string(),
      historicalBackground: z.string(),
      redemptiveHistory: z.string(),
    })
    .optional(),
  application: z
    .object({
      principles: z.array(z.string()),
      personalApplication: z.string(),
      pastoralPoints: z.array(z.string()),
    })
    .optional(),
});

export interface AnalysisAIResult {
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
}

export async function analyzePassage(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
): Promise<AnalysisAIResult> {
  const startTime = Date.now();
  const { systemPrompt, userPrompt } = buildAnalysisPrompt(
    passageText,
    book,
    chapter,
    verseStart,
    verseEnd,
  );

  const openai = new OpenAI({ apiKey: aiConfig.apiKey });

  const completion = await openai.chat.completions.create({
    model: aiConfig.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: aiConfig.maxTokens,
    temperature: aiConfig.temperature,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 응답이 비어있습니다');
  }

  const parsed = JSON.parse(content);
  const validated = aiResponseSchema.parse(parsed);

  return {
    ...validated,
    aiModel: aiConfig.model,
    processingTimeMs: Date.now() - startTime,
  };
}

export function parseAIResponse(content: string) {
  const parsed = JSON.parse(content);
  return aiResponseSchema.parse(parsed);
}
