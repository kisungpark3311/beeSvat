import { http, HttpResponse } from 'msw';

// FEAT-2: Verb detail API mock handlers

const mockVerbDetail = {
  id: 'verb-1',
  originalWord: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
  transliteration: '\u0113gap\u0113sen',
  rootForm: '\u03B1\u03B3\u03B1\u03C0\u03B1\u03C9',
  language: 'greek' as const,
  grammar: {
    tense: 'Aorist',
    voice: 'Active',
    mood: 'Indicative',
    person: '3rd',
    number: 'Singular',
    binyan: null,
  },
  meaning: '\uC0AC\uB791\uD558\uB2E4 (\uC544\uAC00\uD398 \uC0AC\uB791)',
  position: 3,
};

const mockReferences = {
  word: '\u03B7\u03B3\u03B1\u03C0\u03B7\u03C3\u03B5\u03BD',
  references: [
    {
      book: '\uC694\uD55C\uBCF5\uC74C',
      chapter: 3,
      verse: 16,
      passageText:
        '\uD558\uB098\uB2D8\uC774 \uC138\uC0C1\uC744 \uC774\uCC98\uB7FC \uC0AC\uB791\uD558\uC0AC...',
      analysisId: 'analysis-1',
    },
    {
      book: '\uB85C\uB9C8\uC11C',
      chapter: 5,
      verse: 8,
      passageText:
        '\uC6B0\uB9AC\uAC00 \uC544\uC9C1 \uC8C4\uC778 \uB418\uC5C8\uC744 \uB54C\uC5D0...',
      analysisId: 'analysis-2',
    },
  ],
  meta: { page: 1, limit: 5, total: 2, totalPages: 1 },
};

export const verbHandlers = [
  http.get('/api/v1/verbs/:word', () => {
    return HttpResponse.json({ data: mockVerbDetail });
  }),

  http.get('/api/v1/verbs/:word/references', () => {
    return HttpResponse.json({ data: mockReferences });
  }),
];
