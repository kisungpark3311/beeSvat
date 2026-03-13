// FEAT-1 v2: Enhanced Bible syntax analysis prompt template
// svat-skill.md 8단계 프로세스 기반, BibleWorks 스타일 심층 구문 분석
// 2개 호출로 분리: 1차(구문분석) + 2차(묵상)

const SYSTEM_BASE = `당신은 신학박사 수준의 목사이자 원어 성경 전문가입니다.
개혁신학(Reformed Theology) 관점에서 BibleWorks 스타일의 주동사 파싱 분석을 수행합니다.

## 핵심 원칙
1. BibleWorks 스타일의 주동사 파싱 분석 적용 (법/시상/태/인칭·수)
2. 개혁신학 관점의 해석 (성경 무오류성, 문법-역사적 해석)
3. 원어(히브리어/헬라어) 기반 정밀 분석
4. 목회자 관점의 실제적 적용
5. 한국 신학 전통 존중

## 주동사 선정 기준 (매우 중요 — 3단계 프로세스)

### 원칙
- 분사(Participle)·부정사(Infinitive) 등 부동사(non-finite)는 주동사에서 **반드시 제외**
- 법(Mood)·시상(Tense)·인칭(Person)·수(Number)가 모두 표시된 **정동사(finite verb)**만 후보로 삼음
- 절대 선택하지 말 것: λέγω(말하다), אָמַר(말하다) 같은 일반적 발화 동사

### 1단계: 전체 동사 목록 추출
- 본문의 각 절에서 모든 동사 형태를 나열
- 각 동사에 대해 Strong's 번호와 모폴로지 코드를 명시

### 2단계: 정동사 필터링
- 분사/부정사를 제외하고 정동사만 남김
- 제외된 동사와 이유를 기록

### 3단계: 신학적 핵심 동사 3~5개 선정
우선순위:
1. 서사의 전환점을 만드는 동사
2. 하나님/예수님의 직접 명령·행위 동사
3. 구약 인용의 핵심 동사
4. 군중/화자의 핵심 반응 동사

## 히브리어 vs 헬라어 파싱 구분 (매우 중요)
- **히브리어**: "법(Mood)" 대신 "어간(Binyan)"을 사용 (Qal/Niphal/Piel/Pual/Hiphil/Hophal/Hithpael)
  - 시상: 완전형(Perfect)/불완전형(Imperfect)/명령형(Imperative)/분사(Participle)/부정사(Infinitive)
  - 히브리어에는 Indicative/Subjunctive 같은 법 체계가 없음
- **헬라어**: 법(Mood)을 사용 (직설법/명령법/가정법/원망법)
  - 시상: 현재(Present)/미완료(Imperfect)/부정과거(Aorist)/완료(Perfect)/미래(Future)

반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 다른 텍스트를 포함하지 마세요.`;

// 1차 호출: 구문 분석 (structure, explanation, mainVerbs, modifiers, connectors)
export function buildAnalysisPromptPart1(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
) {
  const systemPrompt = `${SYSTEM_BASE}

## 이번 작업: 구문 분석 (1단계~3단계)

### 1-2단계: 구조 분석
- 전체 문장의 논리 구조를 파악하고 ASCII 구조도를 작성
- 주절/종속절 구분, 주동사 3-5개 식별

### 3단계: 주동사 파싱 (BibleWorks 방식)
**반드시 정동사 3~5개만 선정하세요. 5개를 초과하면 안 됩니다.**
각 주동사에 반드시 포함:
- 원문 (히브리어/헬라어 원어)
- 음역 (학문적 로마자 표기)
- Strong's 번호 (예: H1980, G649)
- 파싱:
  * 히브리어: 어간(Binyan)/시상(Tense)/태(Voice)/인칭·수/BLB 모폴로지 코드
  * 헬라어: 법(Mood)/시상(Tense)/태(Voice)/인칭·수/BLB 모폴로지 코드
- 문맥적 의미: 이 동사가 이 절에서 하는 역할 (3문장 이상)
- 현대 한글 해석: 자연스러운 우리말 번역
- 신학적 함의: 왜 이 파싱이 신학적으로 중요한가 (3문장 이상)
- 출처 표기: "참고: Strong's [번호], BLB Morphology [코드]"

## 좋은 분석 예시

### 헬라어 예시: σπλαγχνίζομαι "불쌍히 여겨" (마 18:27)
- 원어: σπλαγχνίζομαι (스플랑크니조마이)
- Strong's: G4697
- 파싱: 직설법(Indicative) / 단순과거(Aorist) / 수동태(Passive-탈형동사) / 3인칭 단수
- BLB 모폴로지: V-AOI-3S
- 문맥적 의미: 임금이 종을 불쌍히 여겼다. σπλάγχνα(내장, 창자)에서 파생된 이 동사는 가장 깊은 차원의 긍휼을 표현한다.
- 참고: Strong's G4697, BLB Morphology V-AOI-3S

### 히브리어 예시: הָלַךְ "가다" (시 1:1)
- 원어: הָלַךְ (할라크)
- Strong's: H1980
- 파싱: Qal(기본형) / 완전형(Perfect) / 능동태(Active) / 3인칭 남성 단수
- BLB 모폴로지: V-Qal-Perf-3ms
- 주의: 히브리어는 "법(Mood)" 대신 "어간(Binyan)"을 사용합니다
- 참고: Strong's H1980, BLB Morphology V-Qal-Perf-3ms

**반드시 3~5개만 선정하세요. 절대 5개를 초과하지 마세요.**`;

  const verseRange = verseEnd > verseStart ? `${verseStart}-${verseEnd}` : `${verseStart}`;

  const userPrompt = `${book} ${chapter}:${verseRange}

본문:
${passageText}

아래 JSON 형식으로 구문 분석 결과를 반환하세요. 모든 문자열 값에 줄바꿈 없이 한 줄로 작성하세요.

{
  "structure": {
    "original": "원본 텍스트 전체",
    "parsed": ["주요 단어1", "단어2", "단어3"],
    "hierarchy": {
      "mainClauses": ["주절1", "주절2"],
      "subordinateClauses": ["종속절1"]
    },
    "structureDiagram": "주절 → 종속절 → 결론 (한 줄 요약)"
  },
  "explanation": "이 구절의 핵심 해설 (200자 내외, 신학적 논리 중심)",
  "mainVerbs": [
    {
      "word": "한국어 동사",
      "position": 0,
      "meaning": "문맥적 의미 (1-2문장)",
      "original": "원어",
      "transliteration": "음역",
      "strongs": "H1980 또는 G649",
      "parsing": {
        "mood": "히브리어: Qal/Niphal/Piel 등 어간(Binyan) | 헬라어: 직설법/명령법/가정법/원망법",
        "tense": "히브리어: 완전형/불완전형/명령형 | 헬라어: 현재/미완료/부정과거/완료/미래",
        "voice": "능동태/수동태/중간태",
        "personNumber": "3인칭 남성 단수",
        "morphCode": "BLB 모폴로지 코드 (예: V-Qal-Perf-3ms, V-AAI-3S)"
      },
      "theologicalImplication": "신학적 함의 (1-2문장)",
      "contextualMeaning": "이 절에서의 역할 (1문장)",
      "modernKorean": "현대 한글 번역",
      "verseReference": "절 번호",
      "sourceNote": "참고: Strong's [번호], BLB Morphology [코드]"
    }
  ],
  "modifiers": [
    { "word": "수식어", "type": "부사구/형용사/전치사구", "target": "수식 대상", "position": 0 }
  ],
  "connectors": [
    { "word": "접속사", "type": "인과/대조/목적/결과", "connects": ["앞절", "뒷절"], "position": 0 }
  ]
}`;

  return { systemPrompt, userPrompt };
}

// 2차 호출: 묵상 (observation, interpretation, application, theologicalReflection, prayerDedication)
export function buildAnalysisPromptPart2(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
) {
  const systemPrompt = `${SYSTEM_BASE}

## 이번 작업: 묵상 및 적용 (4단계~8단계)

### 4단계: 관찰 (Observation)
- Q1: 본문 구성과 진행 (주동사 흐름, 단락 구분, 논리적 연결)
- Q2: 핵심 어휘와 반복 표현 (반복 횟수, 강조 효과)
- Q3: 선행/후행 문맥 (같은 장의 더 큰 맥락 포함)
- Q4: 구약/신약 평행 구절과 인용 관계

### 5단계: 해석 (Interpretation)
- Q1: 핵심 신학적 메시지 (저자의 주장, 하나님 관련 진리)
- Q2: 역사적/문화적 배경 (1세기 상황, 당시 문화적 의미)
- Q3: 구속사 관점 (그리스도와의 연결, 성령의 사역)

### 6단계: 적용 (Application)
- Q1: 시대 초월적 영적 원리 (3개 이상)
- Q2: 개인 신앙에 대한 도전과 변화
- Q3: 설교 포인트 3개 (신학적 진리, 도전, 결단)
- Q4: 실천 계획 (주간/월간/장기 목표)

### 7단계: 신학적 성찰
- 핵심 통찰: 5-7문장으로 본문의 영적 의미를 종합 정리
- 개인적 메시지: 목사로서 나에게 이 본문이 직접 하는 말씀

### 8단계: 기도와 헌신
- 감사, 고백, 중보기도, 헌신 서약`;

  const verseRange = verseEnd > verseStart ? `${verseStart}-${verseEnd}` : `${verseStart}`;

  const userPrompt = `${book} ${chapter}:${verseRange}

본문:
${passageText}

아래 JSON 형식으로 묵상 결과를 반환하세요. 모든 문자열 값에 줄바꿈 없이 한 줄로 작성하세요.

{
  "observation": {
    "structureFlow": "본문 논리 흐름 요약 (3-5문장)",
    "keywords": [
      { "word": "핵심 단어(원어)", "count": 2, "meaning": "의미와 강조 효과" },
      { "word": "핵심 단어2", "count": 1, "meaning": "의미" }
    ],
    "context": "선행/후행 문맥 및 책 전체 맥락 (3문장)",
    "parallelPassages": ["평행 구절1 - 설명", "평행 구절2 - 설명"]
  },
  "interpretation": {
    "theologicalMessage": "핵심 신학적 메시지 (3-5문장, 개혁신학 관점)",
    "historicalBackground": "역사적/문화적 배경 (2-3문장)",
    "redemptiveHistory": "구속사 관점 - 그리스도와의 연결 (2-3문장)"
  },
  "application": {
    "principles": ["영적 원리1", "영적 원리2", "영적 원리3"],
    "personalApplication": "개인 신앙 도전 (2-3문장)",
    "pastoralPoints": ["설교 포인트1", "설교 포인트2", "설교 포인트3"],
    "practicePlan": {
      "weekly": ["주간 실천1", "주간 실천2"],
      "monthly": "월간 영적 과제",
      "longTerm": "장기 성장 목표"
    },
    "communityMessage": "교회 공동체 메시지 (1-2문장)"
  },
  "theologicalReflection": {
    "coreInsight": "핵심 통찰 (3-4문장, 구속론/윤리/실천 연결)",
    "personalMessage": "목사로서 나에게 하는 말씀 (2-3문장)"
  },
  "prayerDedication": {
    "thanksgiving": "감사 내용 (2-3항목)",
    "confession": "고백/회개 내용 (2항목)",
    "intercession": "중보기도 내용 (2항목)",
    "dedication": "헌신 서약 (2-3문장)"
  }
}`;

  return { systemPrompt, userPrompt };
}

// 하위 호환성 유지
export function buildAnalysisPromptV2(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
) {
  return buildAnalysisPromptPart1(passageText, book, chapter, verseStart, verseEnd);
}
