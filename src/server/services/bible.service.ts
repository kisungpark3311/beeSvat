import { AuthError } from '@/server/middleware/auth.middleware';
import type {
  BiblePassageResponse,
  BibleSearchResponse,
  TodayQTResponse,
} from '@contracts/bible.contract';

// FEAT-4: Bible Text service (MVP with hardcoded data)

// Korean Bible book name validation
const VALID_BOOKS = [
  '창세기',
  '출애굽기',
  '레위기',
  '민수기',
  '신명기',
  '여호수아',
  '사사기',
  '룻기',
  '사무엘상',
  '사무엘하',
  '열왕기상',
  '열왕기하',
  '역대상',
  '역대하',
  '에스라',
  '느헤미야',
  '에스더',
  '욥기',
  '시편',
  '잠언',
  '전도서',
  '아가',
  '이사야',
  '예레미야',
  '예레미야애가',
  '에스겔',
  '다니엘',
  '호세아',
  '요엘',
  '아모스',
  '오바댜',
  '요나',
  '미가',
  '나훔',
  '하박국',
  '스바냐',
  '학개',
  '스가랴',
  '말라기',
  '마태복음',
  '마가복음',
  '누가복음',
  '요한복음',
  '사도행전',
  '로마서',
  '고린도전서',
  '고린도후서',
  '갈라디아서',
  '에베소서',
  '빌립보서',
  '골로새서',
  '데살로니가전서',
  '데살로니가후서',
  '디모데전서',
  '디모데후서',
  '디도서',
  '빌레몬서',
  '히브리서',
  '야고보서',
  '베드로전서',
  '베드로후서',
  '요한일서',
  '요한이서',
  '요한삼서',
  '유다서',
  '요한계시록',
];

// Sample Bible verses (hardcoded for MVP)
const SAMPLE_VERSES: Record<string, Record<number, Record<number, string>>> = {
  요한복음: {
    3: {
      16: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
      17: '하나님이 그 아들을 세상에 보내신 것은 세상을 심판하려 하심이 아니요 그로 말미암아 세상이 구원을 받게 하려 하심이라',
      18: '그를 믿는 자는 심판을 받지 아니하는 것이요 믿지 아니하는 자는 하나님의 독생자의 이름을 믿지 아니하므로 벌써 심판을 받은 것이니라',
    },
    1: {
      1: '태초에 말씀이 계시니라 이 말씀이 하나님과 함께 계셨으니 이 말씀은 곧 하나님이시니라',
    },
  },
  창세기: {
    1: {
      1: '태초에 하나님이 천지를 창조하시니라',
      2: '땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라',
      3: '하나님이 이르시되 빛이 있으라 하시니 빛이 있었고',
    },
  },
  로마서: {
    8: {
      28: '우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라',
    },
  },
};

export function getPassage(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd?: number,
): BiblePassageResponse {
  if (!VALID_BOOKS.includes(book)) {
    throw new AuthError('유효하지 않은 성경 책명입니다', 400);
  }

  const end = verseEnd ?? verseStart;
  const bookData = SAMPLE_VERSES[book];
  if (!bookData?.[chapter]) {
    throw new AuthError('해당 구절을 찾을 수 없습니다. 본문을 직접 입력해주세요.', 404);
  }

  const verses: { book: string; chapter: number; verse: number; text: string }[] = [];
  for (let v = verseStart; v <= end; v++) {
    const text = bookData[chapter]?.[v];
    if (text) {
      verses.push({ book, chapter, verse: v, text });
    }
  }

  if (verses.length === 0) {
    throw new AuthError('해당 구절을 찾을 수 없습니다. 본문을 직접 입력해주세요.', 404);
  }

  return {
    book,
    chapter,
    verseStart,
    verseEnd: end,
    verses,
    fullText: verses.map((v) => v.text).join(' '),
  };
}

export function searchVerses(query: string, page: number, limit: number): BibleSearchResponse {
  // Simple search through sample verses
  const results: {
    book: string;
    chapter: number;
    verse: number;
    text: string;
    matchHighlight: string;
  }[] = [];

  for (const [book, chapters] of Object.entries(SAMPLE_VERSES)) {
    for (const [ch, verses] of Object.entries(chapters)) {
      for (const [v, text] of Object.entries(verses)) {
        if (text.includes(query)) {
          const idx = text.indexOf(query);
          const start = Math.max(0, idx - 20);
          const end = Math.min(text.length, idx + query.length + 20);
          results.push({
            book,
            chapter: Number(ch),
            verse: Number(v),
            text,
            matchHighlight:
              (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : ''),
          });
        }
      }
    }
  }

  const total = results.length;
  const sliced = results.slice((page - 1) * limit, page * limit);

  return {
    query,
    results: sliced,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export function getTodayQT(): TodayQTResponse {
  // For MVP, return a hardcoded QT passage (요한복음 3:16 only)
  return {
    book: '요한복음',
    chapter: 3,
    verseStart: 16,
    verseEnd: 16,
    title: '하나님의 사랑',
    fullText:
      '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라',
    date: new Date().toISOString().split('T')[0] ?? '',
  };
}
