import type {
  AnalysisDetail,
  AnalysisResultData,
  AnalysisListItem,
} from '@contracts/analysis.contract';

// FEAT-2: Analysis mock data

export const mockAnalysisResult: AnalysisResultData = {
  id: 'result-1',
  structure: {
    original:
      '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
    parsed: [
      '하나님이',
      '세상을',
      '이처럼',
      '사랑하사',
      '독생자를',
      '주셨으니',
      '이는',
      '그를',
      '믿는',
      '자마다',
      '멸망하지 않고',
      '영생을',
      '얻게 하려 하심이라',
    ],
    hierarchy: {},
  },
  explanation:
    '이 구절의 핵심 동사는 "사랑하사"입니다. 하나님의 사랑의 대상은 "세상"이며, 그 사랑의 표현은 "독생자를 주셨으니"입니다. "이처럼"은 사랑의 정도를 나타내는 부사이며, "이는"은 그 이유를 설명하는 접속어입니다.',
  mainVerbs: [
    { word: '사랑하사', position: 3, meaning: '아가페 사랑으로 사랑하다', original: 'ηγαπησεν' },
    { word: '주셨으니', position: 5, meaning: '내어 주다, 선물하다', original: 'εδωκεν' },
    { word: '믿는', position: 8, meaning: '신뢰하다, 믿다', original: 'πιστευων' },
    {
      word: '멸망하지 않고',
      position: 10,
      meaning: '파멸되다, 멸망하다 (부정)',
      original: 'μη απόληται',
    },
    { word: '얻게 하려 하심이라', position: 12, meaning: '가지다, 소유하다', original: 'εχη' },
  ],
  modifiers: [
    { word: '이처럼', type: '부사', target: '사랑하사', position: 2 },
    { word: '독생자를', type: '목적어', target: '주셨으니', position: 4 },
    { word: '영생을', type: '목적어', target: '얻게 하려 하심이라', position: 11 },
  ],
  connectors: [{ word: '이는', type: '접속사', connects: ['주셨으니', '믿는'], position: 6 }],
  aiModel: 'gpt-4',
  processingTimeMs: 3200,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const mockAnalysis: AnalysisDetail = {
  id: 'analysis-1',
  book: '요한복음',
  chapter: 3,
  verseStart: 16,
  verseEnd: 16,
  passageText:
    '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
  status: 'completed',
  rating: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  result: mockAnalysisResult,
};

export const mockAnalysisList: AnalysisListItem[] = [
  {
    id: 'analysis-1',
    book: '요한복음',
    chapter: 3,
    verseStart: 16,
    verseEnd: 16,
    status: 'completed',
    rating: null,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'analysis-2',
    book: '로마서',
    chapter: 8,
    verseStart: 28,
    verseEnd: 28,
    status: 'completed',
    rating: 4,
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'analysis-3',
    book: '시편',
    chapter: 23,
    verseStart: 1,
    verseEnd: 6,
    status: 'pending',
    rating: null,
    createdAt: '2026-01-03T00:00:00.000Z',
  },
];
