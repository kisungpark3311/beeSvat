# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
# 개발 서버
npm run dev

# 빌드 & 린트
npm run build
npm run lint

# 단위 테스트 (Vitest)
npm test                          # 전체
npm test -- --run src/__tests__/server/unit/services/bible.service.test.ts  # 단일 파일
npm test -- --run --reporter=verbose  # 상세 출력

# E2E 테스트 (Playwright) — 서버 실행 후 실행
npm run test:e2e
npx playwright test e2e/auth.spec.ts  # 단일 파일

# DB 관리
npm run db:migrate     # 마이그레이션 실행
npm run db:generate    # Prisma 클라이언트 재생성
npm run db:studio      # Prisma Studio 열기
docker-compose up -d   # PostgreSQL 시작
```

## 아키텍처 개요

### 레이어 구조

```
contracts/          # 공유 Zod 스키마 + TypeScript 타입 (API 경계 계약)
src/app/api/v1/     # Next.js Route Handlers (REST API)
src/server/
  config/           # AI 공급자, JWT 설정
  middleware/       # 인증, 에러 처리
  prompts/          # AI 프롬프트 템플릿 (analysis-v2.prompt)
  schemas/          # 서버 전용 Zod 스키마
  services/         # 비즈니스 로직 (ai, bible, meditation 등)
src/components/     # React 컴포넌트
src/app/            # Next.js 페이지 (App Router)
prisma/             # DB 스키마 + 마이그레이션
```

### 핵심 데이터 흐름

1. 사용자가 성경 본문 입력 → `POST /api/v1/analysis` → `ai.service.ts`
2. AI 서비스가 Anthropic → Gemini → OpenAI 순서로 폴백
3. 분석 결과를 PostgreSQL JSONB에 저장 (`AnalysisResult` 모델)
4. SSE 스트리밍: `POST /api/v1/analysis/[id]/stream`으로 실시간 진행 상황 전달

### AI 공급자 설정

`src/server/config/ai.config.ts`에서 환경 변수 `AI_PROVIDER`로 제어 (`anthropic` | `gemini` | `openai`). 기본값 `gemini`.

### 계약 우선(Contract-First) 패턴

`contracts/` 디렉토리의 Zod 스키마가 API 요청/응답의 단일 소스. 서버 및 클라이언트 모두 이 계약을 임포트하여 타입 안전성 보장.

### 성경 텍스트 우선순위

`bible.service.ts`는 두 소스를 순서대로 시도:

1. `../../700_Ko_Bible/` 마크다운 파일 (`###### 1` 형식 절 마커 파싱)
2. 하드코딩된 `SAMPLE_VERSES` 딕셔너리 (폴백)

---

## 구문 분석 방법론

> **핵심 원칙**: `scripts/svat-skill.md`가 구문 분석의 최우선 참조 문서.

### 원문 파싱 출처

구문 분석 시 다음 소스를 **이 순서로** 사용:

| 우선순위 | 소스                                                                                       | 용도                                                      |
| -------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| 1        | [blueletterbible.org](https://www.blueletterbible.org)                                     | Strong's 번호 + 모폴로지 코드 (web_fetch로 직접 가져오기) |
| 2        | [biblestudytools.com/interlinear-bible](https://www.biblestudytools.com/interlinear-bible) | 인터리니어 파싱 코드 확인                                 |
| 3        | [stepbible.org](https://www.stepbible.org)                                                 | Tyndale House 학술 모폴로지 데이터                        |
| 4        | 학습 데이터 (헬라어/히브리어 문법 지식)                                                    | 위 소스 보완용 (출처 명시 필수)                           |

**출처 명시 형식**: `참고: Strong's G649, BLB Morphology V-AAI-3S`

### 주동사(Main Verb) 선정 프로세스

반드시 아래 3단계 순서를 따를 것:

**1단계 — BLB에서 전체 동사 목록 추출**

- `web_fetch`로 blueletterbible.org 해당 본문 페이지 접근
- 각 절의 모든 동사 형태 나열

**2단계 — 정동사 필터링**

- 분사(Participle), 부정사(Infinitive) 제외
- 정동사(Indicative / Imperative / Subjunctive / Optative)만 선별
- 헬라어: 법(Mood)·시상(Tense)·태(Voice)·인칭(Person)·수(Number) 모두 표시된 동사
- 히브리어: Binyan(어간)·Tense(시제)·인칭·성·수 표시된 동사

**3단계 — 신학적 핵심 동사 3~5개 선정**

우선순위:

1. 서사의 전환점을 만드는 동사
2. 예수님/하나님의 직접 명령·행위 동사
3. 구약 인용의 핵심 동사
4. 군중/화자의 핵심 반응 동사

**파싱 출력 형식**:

```markdown
| 항목         | 내용                |
| ------------ | ------------------- |
| 원문         | ἀπέστειλεν          |
| 음역         | apesteilen          |
| Strong's     | G649                |
| BLB 모폴로지 | V-AAI-3S            |
| 법           | Indicative (직설법) |
| 시상         | Aorist (단순 과거)  |
| 태           | Active (능동)       |
| 인칭/수      | 3rd Singular        |
| 의미         | "그가 보내셨다"     |
| 신학적 함의  | ...                 |

참고: Strong's G649, BLB Morphology V-AAI-3S
```

---

## 테스트 패턴

- `prismaMock`은 모듈 레벨 싱글톤 (`getMockPrismaInternal` 패턴) — 테스트 간 상태 오염 주의
- Next.js 15 비동기 params: `{ params }: { params: Promise<{ id: string }> }`
- Prisma JSON 필드는 `as any` 캐스팅 (ESLint 경고 7개, 의도적)
- 한국어 성경 책명은 API 라우트에서 `decodeURIComponent` 적용

## 환경 변수 (.env)

| 변수                                                      | 설명                                |
| --------------------------------------------------------- | ----------------------------------- |
| `DATABASE_URL`                                            | PostgreSQL 연결 문자열              |
| `JWT_SECRET` / `JWT_REFRESH_SECRET`                       | JWT 서명 키                         |
| `AI_PROVIDER`                                             | `anthropic` \| `gemini` \| `openai` |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY` | AI API 키                           |
