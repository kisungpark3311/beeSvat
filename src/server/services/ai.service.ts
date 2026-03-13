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
        strongs: z.string().default(''),
        parsing: z.preprocess(
          (val) => {
            if (!val || typeof val !== 'object') return undefined;
            const obj = val as Record<string, unknown>;
            return {
              mood: String(
                obj.mood ??
                  obj['법'] ??
                  obj['법(Mood)'] ??
                  obj.binyan ??
                  obj['어간'] ??
                  obj['어간(Binyan)'] ??
                  '',
              ),
              tense: String(obj.tense ?? obj['시상'] ?? obj['시상(Tense)'] ?? ''),
              voice: String(obj.voice ?? obj['태'] ?? obj['태(Voice)'] ?? ''),
              personNumber: String(
                obj.personNumber ?? obj['인칭/수'] ?? obj.person ?? obj['인칭'] ?? '',
              ),
              morphCode: String(
                obj.morphCode ?? obj['BLB 모폴로지'] ?? obj.blb ?? obj.morphology ?? '',
              ),
              specialForm: obj.specialForm ? String(obj.specialForm) : undefined,
            };
          },
          z
            .object({
              mood: z.string(),
              tense: z.string(),
              voice: z.string(),
              personNumber: z.string(),
              morphCode: z.string(),
              specialForm: z.string().optional(),
            })
            .optional(),
        ),
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
      structureFlow: z.string().default(''),
      keywords: z
        .array(z.object({ word: z.string(), count: z.number().default(0), meaning: z.string() }))
        .default([]),
      context: z.string().default(''),
      parallelPassages: z.array(z.string()).default([]),
    })
    .optional(),
  interpretation: z
    .object({
      theologicalMessage: z.string().default(''),
      historicalBackground: z.string().default(''),
      redemptiveHistory: z.string().default(''),
    })
    .optional(),
  application: z
    .object({
      principles: z.array(z.string()).default([]),
      personalApplication: z.string().default(''),
      pastoralPoints: z.array(z.string()).default([]),
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
      coreInsight: z.string().default(''),
      personalMessage: z.string().default(''),
    })
    .optional(),
  prayerDedication: z
    .object({
      thanksgiving: z.preprocess(
        (v) => (Array.isArray(v) ? v.join('\n') : typeof v === 'string' ? v : ''),
        z.string(),
      ),
      confession: z.preprocess(
        (v) => (Array.isArray(v) ? v.join('\n') : typeof v === 'string' ? v : ''),
        z.string(),
      ),
      intercession: z.preprocess(
        (v) => (Array.isArray(v) ? v.join('\n') : typeof v === 'string' ? v : ''),
        z.string(),
      ),
      dedication: z.preprocess(
        (v) => (Array.isArray(v) ? v.join('\n') : typeof v === 'string' ? v : ''),
        z.string(),
      ),
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

  // 후처리: AI가 strongs/morphCode를 누락한 경우 파싱 데이터에서 자동 생성
  for (const verb of validated.mainVerbs) {
    console.log(
      `[AI] 후처리 verb="${verb.word}" parsing=${JSON.stringify(verb.parsing)} strongs="${verb.strongs}" sourceNote="${verb.sourceNote}"`,
    );

    // parsing이 없으면 빈 객체 생성
    if (!verb.parsing) {
      verb.parsing = { mood: '', tense: '', voice: '', personNumber: '', morphCode: '' };
    }

    // morphCode 자동 생성: 파싱 필드가 있으면 BLB 형식으로 조합
    if (!verb.parsing.morphCode && (verb.parsing.mood || verb.parsing.tense)) {
      verb.parsing.morphCode = buildMorphCode(verb.parsing, verb.original);
      console.log(`[AI] morphCode 자동 생성: ${verb.parsing.morphCode}`);
    }

    // strongs를 sourceNote에서 추출 시도
    if (!verb.strongs && verb.sourceNote) {
      const strongsMatch = verb.sourceNote.match(/Strong's\s+([HG]\d+)/i);
      if (strongsMatch) verb.strongs = strongsMatch[1]!;
    }

    // sourceNote 자동 생성
    const parts: string[] = [];
    if (verb.strongs) parts.push(`Strong's ${verb.strongs}`);
    if (verb.parsing.morphCode) parts.push(`BLB Morphology ${verb.parsing.morphCode}`);
    if (parts.length > 0) {
      verb.sourceNote = `참고: ${parts.join(', ')}`;
    }

    console.log(
      `[AI] 후처리 결과 morphCode="${verb.parsing.morphCode}" strongs="${verb.strongs}" sourceNote="${verb.sourceNote}"`,
    );
  }

  return {
    ...validated,
    aiModel: aiConfig.model,
    processingTimeMs: Date.now() - startTime,
  };
}

// 파싱 필드에서 BLB 모폴로지 코드 자동 생성
function buildMorphCode(
  parsing: { mood: string; tense: string; voice: string; personNumber: string },
  original: string,
): string {
  // 히브리어 여부 판별 (히브리어 유니코드 범위)
  const isHebrew = /[\u0590-\u05FF]/.test(original);

  if (isHebrew) {
    // 히브리어: V-Qal-Perf-3ms 형식
    const binyan = parseHebrewBinyan(parsing.mood);
    const tense = parseHebrewTense(parsing.tense);
    const pn = parsePersonNumber(parsing.personNumber, true);
    if (binyan && tense) return `V-${binyan}-${tense}-${pn}`;
  } else {
    // 헬라어: V-AAI-3S 형식
    const tense = parseGreekTense(parsing.tense);
    const voice = parseGreekVoice(parsing.voice);
    const mood = parseGreekMood(parsing.mood);
    const pn = parsePersonNumber(parsing.personNumber, false);
    if (tense && voice && mood) return `V-${tense}${voice}${mood}-${pn}`;
  }
  return '';
}

function parseHebrewBinyan(mood: string): string {
  const map: Record<string, string> = {
    qal: 'Qal',
    niphal: 'Niphal',
    piel: 'Piel',
    pual: 'Pual',
    hiphil: 'Hiphil',
    hophal: 'Hophal',
    hithpael: 'Hithpael',
  };
  const lower = mood.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return mood || '';
}

function parseHebrewTense(tense: string): string {
  if (/완전형|perfect/i.test(tense)) return 'Perf';
  if (/불완전형|imperfect/i.test(tense)) return 'Imperf';
  if (/명령형|imperative/i.test(tense)) return 'Impv';
  if (/분사|participle/i.test(tense)) return 'Ptc';
  if (/부정사|infinitive/i.test(tense)) return 'Inf';
  return '';
}

function parseGreekTense(tense: string): string {
  if (/부정과거|aorist/i.test(tense)) return 'A';
  if (/현재|present/i.test(tense)) return 'P';
  if (/미완료|imperfect/i.test(tense)) return 'I';
  if (/완료|perfect/i.test(tense)) return 'R';
  if (/미래|future/i.test(tense)) return 'F';
  if (/대과거|pluperfect/i.test(tense)) return 'L';
  return '';
}

function parseGreekVoice(voice: string): string {
  if (/능동|active/i.test(voice)) return 'A';
  if (/중간|middle/i.test(voice)) return 'M';
  if (/수동|passive/i.test(voice)) return 'P';
  return '';
}

function parseGreekMood(mood: string): string {
  if (/직설법|indicative/i.test(mood)) return 'I';
  if (/명령법|imperative/i.test(mood)) return 'M';
  if (/가정법|접속법|subjunctive/i.test(mood)) return 'S';
  if (/원망법|희구법|optative/i.test(mood)) return 'O';
  if (/분사|participle/i.test(mood)) return 'P';
  if (/부정사|infinitive/i.test(mood)) return 'N';
  return '';
}

function parsePersonNumber(pn: string, isHebrew: boolean): string {
  const personMatch = pn.match(/([123])/);
  const person = personMatch ? personMatch[1] : '';

  let number = '';
  if (/단수|singular|sg/i.test(pn)) number = isHebrew ? 's' : 'S';
  else if (/복수|plural|pl/i.test(pn)) number = isHebrew ? 'p' : 'P';

  let gender = '';
  if (isHebrew) {
    if (/남성|masculine|male/i.test(pn)) gender = 'm';
    else if (/여성|feminine|female/i.test(pn)) gender = 'f';
    else if (/공통|common/i.test(pn)) gender = 'c';
  }

  return isHebrew ? `${person}${gender}${number}` : `${person}${number}`;
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
