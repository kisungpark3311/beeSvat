import * as fs from 'fs';
import * as path from 'path';
import { AuthError } from '@/server/middleware/auth.middleware';
import type {
  BiblePassageResponse,
  BibleSearchResponse,
  TodayQTResponse,
} from '@contracts/bible.contract';

// FEAT-4: Bible Text service - 700_Ko_Bible MD 파일 우선, SAMPLE_VERSES 폴백

// 700_Ko_Bible 폴더 경로 (프로젝트 루트 기준 상대 경로 또는 env 변수)
const BIBLE_FILES_DIR =
  process.env.BIBLE_FILES_DIR ?? path.join(process.cwd(), '..', '..', '700_Ko_Bible');

function findChapterFilePath(bookName: string, chapter: number): string | null {
  if (!fs.existsSync(BIBLE_FILES_DIR)) return null;
  const entries = fs.readdirSync(BIBLE_FILES_DIR, { withFileTypes: true });
  const bookDir = entries.find((e) => e.isDirectory() && e.name.includes(bookName));
  if (!bookDir) return null;
  const bookPath = path.join(BIBLE_FILES_DIR, bookDir.name);
  const files = fs.readdirSync(bookPath);
  // 파일명 패턴: 한글약자 + 장번호 + .md (예: 마20.md, 고전5.md)
  const chapterFile = files.find((f) => {
    const m = f.match(/^[가-힣]+(\d+)\.md$/);
    return m != null && parseInt(m[1]!) === chapter;
  });
  return chapterFile ? path.join(bookPath, chapterFile) : null;
}

function parseChapterVerses(filePath: string): Record<number, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const verses: Record<number, string> = {};
  let currentVerse: number | null = null;
  let currentLines: string[] = [];
  for (const line of content.split('\n')) {
    const m = line.match(/^#{6}\s+(\d+)\s*$/);
    if (m) {
      if (currentVerse !== null && currentLines.length > 0) {
        verses[currentVerse] = currentLines.join(' ').trim();
      }
      currentVerse = parseInt(m[1]!);
      currentLines = [];
    } else if (currentVerse !== null) {
      const t = line.trim();
      if (
        t &&
        !t.startsWith('#') &&
        !t.startsWith('◁') &&
        !t.startsWith('*') &&
        !t.startsWith('[[')
      ) {
        currentLines.push(t);
      }
    }
  }
  if (currentVerse !== null && currentLines.length > 0) {
    verses[currentVerse] = currentLines.join(' ').trim();
  }
  return verses;
}

function getChapterData(bookName: string, chapter: number): Record<number, string> | null {
  // 1순위: 700_Ko_Bible MD 파일
  const filePath = findChapterFilePath(bookName, chapter);
  if (filePath) {
    const verses = parseChapterVerses(filePath);
    if (Object.keys(verses).length > 0) return verses;
  }
  // 2순위: 하드코딩된 SAMPLE_VERSES
  return SAMPLE_VERSES[bookName]?.[chapter] ?? null;
}

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
  마태복음: {
    20: {
      1: '천국은 마치 품꾼을 얻어 포도원에 들여보내려고 이른 아침에 나간 집주인과 같으니',
      2: '그가 하루 한 데나리온씩 품꾼들과 약속하여 포도원에 들여보내고',
      3: '또 제삼시에 나가 보니 장터에 놀고 서 있는 사람들이 또 있는지라',
      4: '그들에게 이르되 너희도 포도원에 들어가라 내가 상당하게 주리라 하니 그들이 가고',
      5: '제육시와 제구시에 또 나가 그와 같이 하고',
      6: '제십일시에도 나가 보니 서 있는 사람들이 또 있는지라 이르되 너희는 어찌하여 종일토록 놀고 여기 서 있느냐',
      7: '이르되 우리를 품꾼으로 쓰는 이가 없음이니이다 이르되 너희도 포도원에 들어가라 하니라',
      8: '저물매 포도원 주인이 청지기에게 이르되 품꾼들을 불러 나중 온 자로부터 시작하여 먼저 온 자까지 삯을 주라 하니',
      9: '제십일시에 온 자들이 와서 한 데나리온씩 받거늘',
      10: '먼저 온 자들이 와서 더 받을 줄 알았더니 그들도 한 데나리온씩 받은지라',
      11: '받은 후 집주인을 원망하여 이르되',
      12: '나중 온 이 사람들은 한 시간밖에 일하지 아니하였거늘 그들을 종일 수고하며 더위를 견딘 우리와 같게 하였나이다',
      13: '주인이 그 중의 한 사람에게 대답하여 이르되 친구여 내가 네게 잘못한 것이 없노라 네가 나와 한 데나리온의 약속을 하지 아니하였느냐',
      14: '네 것이나 가지고 가라 나중 온 이 사람에게 너와 같이 주는 것이 내 뜻이니라',
      15: '내 것을 가지고 내 뜻대로 할 것이 아니냐 내가 선하므로 네가 악하게 보느냐',
      16: '이와 같이 나중 된 자로서 먼저 되고 먼저 된 자로서 나중 되리라',
      17: '예수께서 예루살렘으로 올라가려 하실 때에 열두 제자를 따로 데리시고 길에서 이르시되',
      18: '보라 우리가 예루살렘으로 올라가노니 인자가 대제사장들과 서기관들에게 넘겨지매 그들이 죽이기로 결의하고',
      19: '이방인들에게 넘겨 주어 그를 조롱하며 채찍질하며 십자가에 못 박게 하리니 제삼일에 살아나리라',
      20: '그 때에 세베대의 아들의 어머니가 그 아들들을 데리고 예수께 와서 절하며 무엇을 구하니',
    },
    5: {
      3: '심령이 가난한 자는 복이 있나니 천국이 그들의 것임이요',
      4: '애통하는 자는 복이 있나니 그들이 위로를 받을 것임이요',
      5: '온유한 자는 복이 있나니 그들이 땅을 기업으로 받을 것임이요',
    },
    6: {
      9: '그러므로 너희는 이렇게 기도하라 하늘에 계신 우리 아버지여 이름이 거룩히 여김을 받으시오며',
      10: '나라가 임하시오며 뜻이 하늘에서 이루어진 것같이 땅에서도 이루어지이다',
      11: '오늘 우리에게 일용할 양식을 주시옵고',
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
  const chapterData = getChapterData(book, chapter);
  if (!chapterData) {
    throw new AuthError('해당 구절을 찾을 수 없습니다. 본문을 직접 입력해주세요.', 404);
  }

  const verses: { book: string; chapter: number; verse: number; text: string }[] = [];
  for (let v = verseStart; v <= end; v++) {
    const text = chapterData[v];
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
    fullText: verses.map((v) => v.text).join('\n'),
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
