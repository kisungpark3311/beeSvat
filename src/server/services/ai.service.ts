import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { aiConfig } from '@/server/config/ai.config';
import {
  buildAnalysisPromptPart1,
  buildAnalysisPromptPart2,
} from '@/server/prompts/analysis-v2.prompt';
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
  mainVerbs: z.preprocess(
    (val) => {
      let items: unknown[] = [];

      // AI가 객체로 반환할 경우 배열로 변환
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        const obj = val as Record<string, unknown>;
        if ('word' in obj || 'original' in obj) {
          items = [obj];
        } else {
          // 내부에 배열이 있으면 추출, 아니면 values
          const arrays = Object.values(obj).filter(Array.isArray);
          items = arrays.length > 0 ? arrays.flat() : Object.values(obj);
        }
      } else if (Array.isArray(val)) {
        items = val;
      }

      // 유효한 동사 항목만 필터링 (word 또는 original이 있는 것)
      const valid = items.filter(
        (item) =>
          item &&
          typeof item === 'object' &&
          (('word' in (item as Record<string, unknown>) &&
            typeof (item as Record<string, unknown>).word === 'string') ||
            ('original' in (item as Record<string, unknown>) &&
              typeof (item as Record<string, unknown>).original === 'string')),
      );

      // 5개 초과 시 처음 5개만 사용
      return valid.slice(0, 5);
    },
    z.array(
      z.object({
        word: z.string().default(''),
        position: z.number().default(0),
        meaning: z.string().default(''),
        original: z.string().default(''),
        transliteration: z.string().optional(),
        strongs: z.string().optional(),
        parsing: z
          .object({
            mood: z.string(),
            tense: z.string(),
            voice: z.string(),
            personNumber: z.string(),
            morphCode: z.string().optional(),
            specialForm: z.string().optional(),
          })
          .optional(),
        theologicalImplication: z.string().optional(),
        contextualMeaning: z.string().optional(),
        modernKorean: z.string().optional(),
        verseReference: z.string().optional(),
        sourceNote: z.string().optional(),
      }),
    ),
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

  const stream = await client.messages.stream(
    {
      model: aiConfig.anthropicModel,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    },
    {
      headers: {
        'anthropic-beta': 'output-128k-2025-02-19',
      },
    },
  );

  const response = await stream.finalMessage();
  console.log(
    `[AI] stop_reason=${response.stop_reason}, usage=${JSON.stringify(response.usage)}, model=${response.model}`,
  );
  if (response.stop_reason === 'max_tokens') {
    console.warn(`[AI] 응답이 max_tokens(${aiConfig.maxTokens})에서 잘렸습니다.`);
  }
  const block = response.content[0];
  if (!block || block.type !== 'text') {
    throw new Error('AI 응답이 비어있습니다');
  }
  console.log(`[AI] 응답 길이: ${block.text.length}자`);
  return block.text;
}

// Google Gemini 호출
async function callGemini(systemPrompt: string, userPrompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(aiConfig.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: aiConfig.geminiModel,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: aiConfig.temperature,
      maxOutputTokens: aiConfig.maxTokens,
      responseMimeType: 'application/json',
    },
  });
  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  if (!text) throw new Error('AI 응답이 비어있습니다');
  return text;
}

// OpenAI 호출
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

// ZhipuAI GLM 호출 (OpenAI 호환 API)
async function callGLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const glm = new OpenAI({
    apiKey: aiConfig.glmApiKey,
    baseURL: aiConfig.glmBaseUrl,
  });

  const completion = await glm.chat.completions.create({
    model: aiConfig.glmModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: aiConfig.maxTokens,
    temperature: aiConfig.temperature,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AI 응답이 비어있습니다');
  }
  return content;
}

async function callProvider(systemPrompt: string, userPrompt: string): Promise<string> {
  if (aiConfig.provider === 'anthropic') {
    return callAnthropic(systemPrompt, userPrompt);
  } else if (aiConfig.provider === 'gemini') {
    return callGemini(systemPrompt, userPrompt);
  } else if (aiConfig.provider === 'glm') {
    return callGLM(systemPrompt, userPrompt);
  } else {
    return callOpenAI(systemPrompt, userPrompt);
  }
}

function repairJSON(str: string): string {
  // JSON 문자열 내부의 리터럴 줄바꿈을 \n으로 이스케이프
  let inString = false;
  let escaped = false;
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      result += ch;
      continue;
    }
    if (inString && ch === '\n') {
      result += '\\n';
      continue;
    }
    if (inString && ch === '\r') {
      result += '\\r';
      continue;
    }
    if (inString && ch === '\t') {
      result += '\\t';
      continue;
    }
    result += ch;
  }
  return result;
}

function findBalancedJSON(content: string): string {
  const start = content.indexOf('{');
  if (start === -1) throw new Error('AI 응답에서 JSON을 찾을 수 없습니다');
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return content.slice(start, i + 1);
    }
  }
  return content.slice(start);
}

function extractJSON(content: string): unknown {
  const raw = findBalancedJSON(content);
  console.log(
    `[AI] extractJSON: raw 길이=${raw.length}, 첫 50자=${raw.slice(0, 50)}, 마지막 50자=${raw.slice(-50)}`,
  );
  try {
    return JSON.parse(raw);
  } catch (e1) {
    console.warn(`[AI] JSON 파싱 1차 실패: ${e1 instanceof Error ? e1.message : e1}`);
    // position 주변 문자 확인
    const match = String(e1 instanceof Error ? e1.message : e1).match(/position (\d+)/);
    if (match) {
      const pos = parseInt(match[1]!);
      console.warn(
        `[AI] 에러 위치 주변(${pos - 20}~${pos + 20}): ${JSON.stringify(raw.slice(Math.max(0, pos - 20), pos + 20))}`,
      );
    }
    try {
      return JSON.parse(repairJSON(raw));
    } catch (e2) {
      console.error(`[AI] JSON 파싱 2차(repair) 실패: ${e2 instanceof Error ? e2.message : e2}`);
      throw e2;
    }
  }
}

export async function analyzePassage(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
): Promise<AnalysisAIResult> {
  const startTime = Date.now();

  // 1차 호출: 구문 분석 (structure, explanation, mainVerbs, modifiers, connectors)
  const part1 = buildAnalysisPromptPart1(passageText, book, chapter, verseStart, verseEnd);
  const content1 = await callProvider(part1.systemPrompt, part1.userPrompt);
  const parsed1 = extractJSON(content1);

  // 2차 호출: 묵상 (observation, interpretation, application, theologicalReflection, prayerDedication)
  const part2 = buildAnalysisPromptPart2(passageText, book, chapter, verseStart, verseEnd);
  const content2 = await callProvider(part2.systemPrompt, part2.userPrompt);
  const parsed2 = extractJSON(content2);

  // Part1 필드를 Part2가 덮어쓰지 않도록 선택적 병합
  const p1 = parsed1 as Record<string, unknown>;
  const p2 = parsed2 as Record<string, unknown>;
  const part1Keys = ['structure', 'explanation', 'mainVerbs', 'modifiers', 'connectors'];
  const part2Keys = [
    'observation',
    'interpretation',
    'application',
    'theologicalReflection',
    'prayerDedication',
  ];
  const merged: Record<string, unknown> = {};
  // Part1 전용 필드는 Part1에서만 가져옴
  for (const key of part1Keys) {
    if (p1[key] !== undefined) merged[key] = p1[key];
  }
  // Part2 전용 필드는 Part2에서만 가져옴
  for (const key of part2Keys) {
    if (p2[key] !== undefined) merged[key] = p2[key];
  }
  const validated = aiResponseSchema.parse(merged);

  return {
    ...validated,
    aiModel: aiConfig.model,
    processingTimeMs: Date.now() - startTime,
  };
}

export function parseAIResponse(content: string) {
  const raw = findBalancedJSON(content);
  try {
    const parsed = JSON.parse(raw);
    return aiResponseSchema.parse(parsed);
  } catch {
    const parsed = JSON.parse(repairJSON(raw));
    return aiResponseSchema.parse(parsed);
  }
}
