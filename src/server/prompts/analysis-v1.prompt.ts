// FEAT-1: Bible syntax analysis prompt template (v1)
// svat-skill.md 기반 BibleWorks 스타일 주동사 파싱 분석

export function buildAnalysisPrompt(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
) {
  const systemPrompt = `당신은 신학박사 수준의 개혁신학(Reformed Theology) 관점 성경 구문 분석 전문가입니다.
BibleWorks 스타일의 주동사 파싱 분석을 적용합니다.

## 분석 원칙
1. BibleWorks 스타일의 주동사 파싱 분석 적용 (법/시상/태/인칭·수)
2. 개혁신학 관점의 해석
3. 원어(히브리어/헬라어) 기반 분석
4. 구체적이고 측정 가능한 적용점

## 분석 프로세스
1단계: 구조 분석 - 전체 문장의 논리 구조 파악, 주동사 식별 (최대 3-5개)
2단계: 주동사 파싱 - 각 주동사의 원문, 음역, 법/시상/태/인칭·수 분석
3단계: 수식어/접속사 식별 - 부동사/분사/부사구/접속사 파악
4단계: 관찰 - 본문 구성, 핵심 어휘, 문맥, 평행 구절
5단계: 해석 - 신학적 메시지, 역사적 배경, 구속사 관점
6단계: 적용 - 영적 원리, 개인 적용, 목회 포인트

반드시 아래 JSON 형식으로 응답하세요. 다른 텍스트를 포함하지 마세요.`;

  const verseRange = verseEnd > verseStart ? `${verseStart}-${verseEnd}` : `${verseStart}`;

  const userPrompt = `${book} ${chapter}:${verseRange}

본문:
${passageText}

아래 JSON 형식으로 BibleWorks 스타일 구문 분석 결과를 반환하세요:
{
  "structure": {
    "original": "원본 텍스트",
    "parsed": ["단어1", "단어2", ...],
    "hierarchy": {
      "mainClauses": ["주절1", "주절2"],
      "subordinateClauses": ["종속절1"]
    }
  },
  "explanation": "이 구절에 대한 해설 (300자 내외). 개혁신학 관점에서 핵심 동사의 의미와 문맥을 설명합니다.",
  "mainVerbs": [
    {
      "word": "한국어 동사",
      "position": 0,
      "meaning": "문맥적 의미 설명",
      "original": "원어 (히브리어/헬라어)",
      "transliteration": "음역",
      "parsing": {
        "mood": "직설법/명령법/가정법/부정사/분사",
        "tense": "현재/미완료/완료/미래 (헬라어) 또는 완전형/불완전형 (히브리어)",
        "voice": "능동태/수동태/중간태",
        "personNumber": "3인칭 단수 등"
      },
      "theologicalImplication": "이 파싱이 신학적으로 의미 있는 이유"
    }
  ],
  "modifiers": [
    { "word": "수식어", "type": "부사/형용사/목적어 등", "target": "수식 대상 단어", "position": 0 }
  ],
  "connectors": [
    { "word": "접속사", "type": "접속사 유형 (인과/대조/목적 등)", "connects": ["앞절", "뒷절"], "position": 0 }
  ],
  "observation": {
    "structureFlow": "본문의 논리적 흐름과 주동사 진행 설명",
    "keywords": [
      { "word": "핵심 단어", "count": 1, "meaning": "의미와 강조점" }
    ],
    "context": "선행/후행 문맥 설명",
    "parallelPassages": ["평행 구절 참조 (예: 롬 8:28)"]
  },
  "interpretation": {
    "theologicalMessage": "핵심 신학적 메시지 (개혁신학 관점)",
    "historicalBackground": "역사적/문화적 배경",
    "redemptiveHistory": "구속사 내 위치 (그리스도/성령 연결)"
  },
  "application": {
    "principles": ["시대 초월적 영적 원리 1", "원리 2", "원리 3"],
    "personalApplication": "개인 신앙에 대한 도전과 변화",
    "pastoralPoints": ["설교 포인트 1", "포인트 2", "포인트 3"]
  }
}`;

  return { systemPrompt, userPrompt };
}
