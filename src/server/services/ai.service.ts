import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { z } from 'zod';
import { aiConfig } from '@/server/config/ai.config';
import { buildAnalysisPromptV2 } from '@/server/prompts/analysis-v2.prompt';
import type {
  AnalysisStructure,
  MainVerb,
  Modifier,
  Connector,
  AnalysisObservation,
  AnalysisInterpretation,
  AnalysisApplication,
  AnalysisTheologicalReflection,
  AnalysisPrayerDedication,
} from '@contracts/analysis.contract';

// FEAT-1 v2: AI syntax analysis service (BibleWorks 스타일 심층 파싱)

// Zod schema for AI response validation (v2 - enhanced)
const aiResponseSchema = z.object({
  structure: z.object({
    original: z.string(),
    parsed: z.array(z.string()),
    hierarchy: z.record(z.unknown()),
    structureDiagram: z.string().optional(),
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
      // v2 확장 필드
      contextualMeaning: z.string().optional(),
      modernKorean: z.string().optional(),
      verseReference: z.string().optional(),
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
  // v2: observation/interpretation/application은 필수로 요청하되 Zod에서는 optional 유지 (하위호환)
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
      practicePlan: z
        .object({
          weekly: z.array(z.string()).optional(),
          monthly: z.string().optional(),
          longTerm: z.string().optional(),
        })
        .optional(),
      communityMessage: z.string().optional(),
    })
    .optional(),
  // v2 신규 섹션
  theologicalReflection: z
    .object({
      coreInsight: z.string(),
      personalMessage: z.string(),
    })
    .optional(),
  prayerDedication: z
    .object({
      thanksgiving: z.union([z.string(), z.array(z.string()).transform((arr) => arr.join('\n'))]),
      confession: z.union([z.string(), z.array(z.string()).transform((arr) => arr.join('\n'))]),
      intercession: z.union([z.string(), z.array(z.string()).transform((arr) => arr.join('\n'))]),
      dedication: z.union([z.string(), z.array(z.string()).transform((arr) => arr.join('\n'))]),
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
  theologicalReflection?: AnalysisTheologicalReflection;
  prayerDedication?: AnalysisPrayerDedication;
  aiModel: string;
  processingTimeMs: number;
}

// Anthropic Claude 호출
async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: aiConfig.anthropicApiKey });

  const response = await client.messages.create({
    model: aiConfig.anthropicModel,
    max_tokens: aiConfig.maxTokens,
    temperature: aiConfig.temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('AI 응답이 비어있습니다');
  }
  return block.text;
}

// OpenAI 호출 (fallback)
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: aiConfig.openaiApiKey });

  const completion = await openai.chat.completions.create({
    model: aiConfig.openaiModel,
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
  return content;
}

export async function analyzePassage(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
): Promise<AnalysisAIResult> {
  const startTime = Date.now();
  const { systemPrompt, userPrompt } = buildAnalysisPromptV2(
    passageText,
    book,
    chapter,
    verseStart,
    verseEnd,
  );

  let content: string;
  if (aiConfig.provider === 'anthropic') {
    content = await callAnthropic(systemPrompt, userPrompt);
  } else {
    content = await callOpenAI(systemPrompt, userPrompt);
  }

  // Claude는 JSON 앞뒤에 텍스트가 있을 수 있으므로 추출
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
  }

  const parsed = JSON.parse(jsonMatch[0]);
  const validated = aiResponseSchema.parse(parsed);

  return {
    ...validated,
    aiModel: aiConfig.model,
    processingTimeMs: Date.now() - startTime,
  };
}

export function parseAIResponse(content: string) {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
  }
  const parsed = JSON.parse(jsonMatch[0]);
  return aiResponseSchema.parse(parsed);
}
