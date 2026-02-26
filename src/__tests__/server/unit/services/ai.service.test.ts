import { describe, it, expect, vi, beforeEach } from 'vitest';

// FEAT-1: AI service unit tests

// Mock OpenAI
const mockCreate = vi.fn();
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  })),
}));

// Mock ai.config
vi.mock('@/server/config/ai.config', () => ({
  aiConfig: {
    model: 'gpt-4o-mini',
    apiKey: 'test-api-key',
    maxTokens: 4000,
    temperature: 0.3,
    timeoutMs: 30000,
  },
}));

import { analyzePassage, parseAIResponse } from '@/server/services/ai.service';
import { buildAnalysisPrompt } from '@/server/prompts/analysis-v1.prompt';

const validAIResponse = {
  structure: {
    original: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니',
    parsed: ['하나님이', '세상을', '이처럼', '사랑하사', '독생자를', '주셨으니'],
    hierarchy: {},
  },
  explanation:
    '이 구절은 하나님의 사랑의 본질과 그 표현을 보여줍니다. 개혁신학 관점에서 하나님의 주권적 사랑이 독생자를 보내심으로 나타났음을 강조합니다.',
  mainVerbs: [
    {
      word: '사랑하사',
      position: 3,
      meaning: '하나님의 주권적이고 무조건적인 사랑',
      original: 'ἠγάπησεν (agapaō)',
      transliteration: 'ēgapēsen',
      parsing: {
        mood: '직설법',
        tense: '부정과거',
        voice: '능동태',
        personNumber: '3인칭 단수',
      },
      theologicalImplication:
        '부정과거 시제는 하나님의 사랑이 특정 시점에 결정적으로 나타났음을 보여준다',
    },
    {
      word: '주셨으니',
      position: 5,
      meaning: '독생자를 보내신 행위',
      original: 'ἔδωκεν (didōmi)',
      transliteration: 'edōken',
      parsing: {
        mood: '직설법',
        tense: '부정과거',
        voice: '능동태',
        personNumber: '3인칭 단수',
      },
      theologicalImplication: '능동태 부정과거는 하나님의 주권적 결단을 강조한다',
    },
  ],
  modifiers: [
    {
      word: '이처럼',
      type: '부사',
      target: '사랑하사',
      position: 2,
    },
    {
      word: '세상을',
      type: '목적어',
      target: '사랑하사',
      position: 1,
    },
  ],
  connectors: [
    {
      word: '~으니',
      type: '인과 접속',
      connects: ['사랑하사', '주셨으니'],
      position: 5,
    },
  ],
  observation: {
    structureFlow: '하나님의 사랑(원인) → 독생자를 주심(결과)의 인과 구조',
    keywords: [
      { word: '사랑', count: 1, meaning: '아가페 사랑, 하나님의 무조건적 사랑' },
      { word: '독생자', count: 1, meaning: '유일한 아들, 그리스도' },
    ],
    context: '니고데모와의 대화 중 구원의 핵심을 선언하는 맥락',
    parallelPassages: ['롬 5:8', '요일 4:9-10', '롬 8:32'],
  },
  interpretation: {
    theologicalMessage:
      '하나님의 사랑은 추상적 감정이 아니라 독생자를 주시는 구체적 행위로 나타났다',
    historicalBackground:
      '유대교 바리새인 니고데모에게 율법을 넘어서는 은혜의 복음을 선포하는 장면',
    redemptiveHistory:
      '구약의 제물 제도가 궁극적으로 하나님의 독생자 예수 그리스도의 십자가 사건으로 성취됨',
  },
  application: {
    principles: [
      '하나님의 사랑은 주권적이고 선행적이다',
      '구원은 하나님의 은혜로운 선물이다',
      '믿음은 하나님의 사랑에 대한 응답이다',
    ],
    personalApplication: '나의 구원이 나의 노력이 아닌 하나님의 사랑에서 비롯됨을 기억하라',
    pastoralPoints: [
      '하나님의 사랑의 주권성과 무조건성 강조',
      '독생자를 주신 희생의 깊이',
      '믿음으로 응답하는 삶의 결단',
    ],
  },
};

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================
  // buildAnalysisPrompt
  // =========================================
  describe('buildAnalysisPrompt', () => {
    it('프롬프트에 성경 책명과 장절이 포함된다', () => {
      const { userPrompt } = buildAnalysisPrompt(
        '하나님이 세상을 이처럼 사랑하사',
        '요한복음',
        3,
        16,
        16,
      );

      expect(userPrompt).toContain('요한복음');
      expect(userPrompt).toContain('3:16');
    });

    it('개혁신학 관점 지시가 포함된다', () => {
      const { systemPrompt } = buildAnalysisPrompt(
        '하나님이 세상을 이처럼 사랑하사',
        '요한복음',
        3,
        16,
        16,
      );

      expect(systemPrompt).toContain('개혁신학');
      expect(systemPrompt).toContain('Reformed Theology');
    });
  });

  // =========================================
  // parseAIResponse
  // =========================================
  describe('parseAIResponse', () => {
    it('유효한 JSON을 올바르게 파싱한다', () => {
      const result = parseAIResponse(JSON.stringify(validAIResponse));

      expect(result.structure.original).toBe('하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니');
      expect(result.mainVerbs).toHaveLength(2);
      expect(result.modifiers).toHaveLength(2);
      expect(result.connectors).toHaveLength(1);
      expect(result.explanation).toContain('개혁신학');
    });

    it('BibleWorks 파싱 정보를 올바르게 파싱한다', () => {
      const result = parseAIResponse(JSON.stringify(validAIResponse));
      const verb = result.mainVerbs[0]!;

      expect(verb.transliteration).toBe('ēgapēsen');
      expect(verb.parsing?.mood).toBe('직설법');
      expect(verb.parsing?.tense).toBe('부정과거');
      expect(verb.parsing?.voice).toBe('능동태');
      expect(verb.parsing?.personNumber).toBe('3인칭 단수');
      expect(verb.theologicalImplication).toContain('부정과거');
    });

    it('관찰/해석/적용 섹션을 올바르게 파싱한다', () => {
      const result = parseAIResponse(JSON.stringify(validAIResponse));

      expect(result.observation?.structureFlow).toContain('인과 구조');
      expect(result.observation?.keywords).toHaveLength(2);
      expect(result.observation?.parallelPassages).toContain('롬 5:8');
      expect(result.interpretation?.theologicalMessage).toContain('독생자');
      expect(result.application?.principles).toHaveLength(3);
      expect(result.application?.pastoralPoints).toHaveLength(3);
    });

    it('BibleWorks 파싱 없이도 기본 필드만으로 파싱 성공한다', () => {
      const minimalResponse = {
        structure: { original: 'test', parsed: ['test'], hierarchy: {} },
        explanation: 'test explanation',
        mainVerbs: [{ word: 'test', position: 0, meaning: 'test', original: 'test' }],
        modifiers: [],
        connectors: [],
      };
      const result = parseAIResponse(JSON.stringify(minimalResponse));
      expect(result.mainVerbs[0]!.transliteration).toBeUndefined();
      expect(result.mainVerbs[0]!.parsing).toBeUndefined();
      expect(result.observation).toBeUndefined();
      expect(result.interpretation).toBeUndefined();
      expect(result.application).toBeUndefined();
    });

    it('잘못된 형식의 JSON은 에러를 던진다', () => {
      expect(() => parseAIResponse('not valid json')).toThrow();
    });

    it('필수 필드 누락 시 에러를 던진다', () => {
      const incomplete = {
        structure: { original: 'test', parsed: ['test'] },
        // explanation 누락
        mainVerbs: [],
      };

      expect(() => parseAIResponse(JSON.stringify(incomplete))).toThrow();
    });

    it('mainVerbs 필드 누락 시 에러를 던진다', () => {
      const missingMainVerbs = {
        structure: { original: 'test', parsed: ['test'], hierarchy: {} },
        explanation: 'test explanation',
        // mainVerbs 누락
        modifiers: [],
        connectors: [],
      };

      expect(() => parseAIResponse(JSON.stringify(missingMainVerbs))).toThrow();
    });
  });

  // =========================================
  // analyzePassage
  // =========================================
  describe('analyzePassage', () => {
    it('OpenAI API를 호출하고 결과를 반환한다', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify(validAIResponse),
            },
          },
        ],
      });

      const result = await analyzePassage(
        '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니',
        '요한복음',
        3,
        16,
        16,
      );

      expect(result.structure.original).toBe('하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니');
      expect(result.mainVerbs).toHaveLength(2);
      expect(result.aiModel).toBe('gpt-4o-mini');
      expect(result.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
        }),
      );
    });

    it('AI 응답이 비어있으면 에러를 던진다', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      });

      await expect(analyzePassage('본문', '요한복음', 3, 16, 16)).rejects.toThrow(
        'AI 응답이 비어있습니다',
      );
    });

    it('AI 응답이 유효하지 않은 JSON이면 에러를 던진다', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'not json',
            },
          },
        ],
      });

      await expect(analyzePassage('본문', '요한복음', 3, 16, 16)).rejects.toThrow();
    });
  });
});
