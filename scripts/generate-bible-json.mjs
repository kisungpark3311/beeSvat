#!/usr/bin/env node
/**
 * 700_Ko_Bible 마크다운 파일을 bible-data.json으로 변환
 * 사용법: node scripts/generate-bible-json.mjs [소스경로]
 */
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_DIR = process.argv[2] || path.join(process.cwd(), '..', '..', '700_Ko_Bible');
const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'bible-data.json');

// 책명 매핑 (폴더명 → 표준 책명)
const BOOK_MAP = {
  창세기: '창세기',
  출애굽기: '출애굽기',
  레위기: '레위기',
  민수기: '민수기',
  신명기: '신명기',
  여호수아: '여호수아',
  사사기: '사사기',
  룻기: '룻기',
  사무엘상: '사무엘상',
  사무엘하: '사무엘하',
  열왕기상: '열왕기상',
  열왕기하: '열왕기하',
  역대상: '역대상',
  역대하: '역대하',
  에스라: '에스라',
  느헤미야: '느헤미야',
  에스더: '에스더',
  욥기: '욥기',
  시편: '시편',
  잠언: '잠언',
  전도서: '전도서',
  아가: '아가',
  이사야: '이사야',
  예레미야: '예레미야',
  예레미야애가: '예레미야애가',
  에스겔: '에스겔',
  다니엘: '다니엘',
  호세아: '호세아',
  요엘: '요엘',
  아모스: '아모스',
  오바댜: '오바댜',
  요나: '요나',
  미가: '미가',
  나훔: '나훔',
  하박국: '하박국',
  스바냐: '스바냐',
  학개: '학개',
  스가랴: '스가랴',
  말라기: '말라기',
  마태복음: '마태복음',
  마가복음: '마가복음',
  누가복음: '누가복음',
  요한복음: '요한복음',
  사도행전: '사도행전',
  로마서: '로마서',
  고린도전서: '고린도전서',
  고린도후서: '고린도후서',
  갈라디아서: '갈라디아서',
  에베소서: '에베소서',
  빌립보서: '빌립보서',
  골로새서: '골로새서',
  데살로니가전서: '데살로니가전서',
  데살로니가후서: '데살로니가후서',
  디모데전서: '디모데전서',
  디모데후서: '디모데후서',
  디도서: '디도서',
  빌레몬서: '빌레몬서',
  히브리서: '히브리서',
  야고보서: '야고보서',
  베드로전서: '베드로전서',
  베드로후서: '베드로후서',
  요한일서: '요한일서',
  요한이서: '요한이서',
  요한삼서: '요한삼서',
  유다서: '유다서',
  요한계시록: '요한계시록',
};

function parseChapterVerses(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const verses = {};
  let currentVerse = null;
  let currentLines = [];

  for (const line of content.split('\n')) {
    const m = line.match(/^#{6}\s+(\d+)\s*$/);
    if (m) {
      if (currentVerse !== null && currentLines.length > 0) {
        verses[currentVerse] = currentLines.join(' ').trim();
      }
      currentVerse = parseInt(m[1]);
      currentLines = [];
    } else if (currentVerse !== null) {
      const t = line.trim();
      if (
        t &&
        !t.startsWith('#') &&
        !t.startsWith('◁') &&
        !t.startsWith('*') &&
        !t.startsWith('[[') &&
        !t.startsWith('||')
      ) {
        const cleaned = t.replace(/\s*\|\|.*$/, '').trim();
        if (cleaned) currentLines.push(cleaned);
      }
    }
  }
  if (currentVerse !== null && currentLines.length > 0) {
    verses[currentVerse] = currentLines.join(' ').trim();
  }
  return verses;
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`소스 디렉토리가 없습니다: ${SOURCE_DIR}`);
  process.exit(1);
}

const result = {};
let totalVerses = 0;
let totalBooks = 0;

const entries = fs
  .readdirSync(SOURCE_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d{2}/.test(e.name))
  .sort((a, b) => a.name.localeCompare(b.name));

for (const entry of entries) {
  // 폴더명에서 책명 추출 (예: "01창세기" → "창세기")
  const rawName = entry.name.replace(/^\d+/, '');
  // 폴더명 → 표준 책명 변환 (이름 차이 처리)
  const FOLDER_ALIAS = {
    역대기상: '역대상',
    역대기하: '역대하',
    요한1서: '요한일서',
    요한2서: '요한이서',
    요한3서: '요한삼서',
  };
  const bookName = FOLDER_ALIAS[rawName] || rawName;
  if (!Object.values(BOOK_MAP).includes(bookName)) {
    console.warn(`알 수 없는 책명 건너뜀: ${entry.name}`);
    continue;
  }

  const bookPath = path.join(SOURCE_DIR, entry.name);
  const files = fs
    .readdirSync(bookPath)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/(\d+)\.md$/)?.[1] || '0');
      const numB = parseInt(b.match(/(\d+)\.md$/)?.[1] || '0');
      return numA - numB;
    });

  const chapters = {};
  for (const file of files) {
    const chapterMatch = file.match(/(\d+)\.md$/);
    if (!chapterMatch) continue;
    const chapter = parseInt(chapterMatch[1]);
    const verses = parseChapterVerses(path.join(bookPath, file));
    if (Object.keys(verses).length > 0) {
      chapters[chapter] = verses;
      totalVerses += Object.keys(verses).length;
    }
  }

  if (Object.keys(chapters).length > 0) {
    result[bookName] = chapters;
    totalBooks++;
  }
}

// 출력 디렉토리 생성
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));
const fileSizeMB = (fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2);
console.log(`생성 완료: ${OUTPUT_FILE}`);
console.log(`  책: ${totalBooks}권, 절: ${totalVerses}개, 파일 크기: ${fileSizeMB}MB`);
