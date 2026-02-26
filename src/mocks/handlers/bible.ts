import { http, HttpResponse } from 'msw';

// FEAT-5.2: Bible API mock handlers
export const bibleHandlers = [
  // GET /api/v1/bible/:book/:chapter - Get Bible passage
  http.get('/api/v1/bible/:book/:chapter', ({ params }) => {
    return HttpResponse.json({
      data: {
        book: decodeURIComponent(params.book as string),
        chapter: Number(params.chapter),
        verseStart: 16,
        verseEnd: 18,
        verses: [
          {
            book: '요한복음',
            chapter: 3,
            verse: 16,
            text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
          },
          {
            book: '요한복음',
            chapter: 3,
            verse: 17,
            text: '하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 그로 말미암아 세상이 구원을 받게 하려 하심이라',
          },
          {
            book: '요한복음',
            chapter: 3,
            verse: 18,
            text: '그를 믿는 자는 심판을 받지 아니하는 것이요 믿지 아니하는 자는 하나님의 독생자의 이름을 믿지 아니하므로 벌써 심판을 받은 것이니라',
          },
        ],
        fullText:
          '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
      },
    });
  }),

  // GET /api/v1/bible/search - Search verses
  http.get('/api/v1/bible/search', () => {
    return HttpResponse.json({
      data: {
        query: '사랑',
        results: [
          {
            book: '요한복음',
            chapter: 3,
            verse: 16,
            text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
            matchHighlight: '...이처럼 사랑하사 독생자를...',
          },
        ],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    });
  }),

  // GET /api/v1/bible/today - Get today's QT
  http.get('/api/v1/bible/today', () => {
    return HttpResponse.json({
      data: {
        book: '요한복음',
        chapter: 3,
        verseStart: 16,
        verseEnd: 18,
        title: '하나님의 사랑',
        fullText:
          '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
        date: '2026-02-26',
      },
    });
  }),
];
