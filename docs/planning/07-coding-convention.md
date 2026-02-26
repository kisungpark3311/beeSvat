# Coding Convention & AI Collaboration Guide - beeSvat

> 고품질/유지보수/보안을 위한 인간-AI 협업 운영 지침서입니다.

---

## MVP 캡슐

| #   | 항목                 | 내용                                                                         |
| --- | -------------------- | ---------------------------------------------------------------------------- |
| 1   | 목표                 | 성경 본문의 구문 구조를 자동 분석하여 초보자도 깊은 묵상을 할 수 있게 돕는다 |
| 2   | 페르소나             | 일반 신자/성경 묵상자 (원어 지식 없는 분)                                    |
| 3   | 핵심 기능            | FEAT-1: 성경 구문 분석 (주동사/수식어 자동 파싱 & 해설)                      |
| 4   | 성공 지표 (노스스타) | 주간 활성 사용자 수                                                          |
| 5   | 입력 지표            | 사용자 만족도 (4.5점 이상)                                                   |
| 6   | 비기능 요구          | 모바일 3초 이내 로딩, 반응형 웹앱                                            |
| 7   | Out-of-scope         | 원어 사전 기능, 소셜 기능, 결제 시스템                                       |
| 8   | Top 리스크           | 구문 분석 AI의 정확도                                                        |
| 9   | 완화/실험            | 개혁신학 관점 검증자 리뷰 프로세스                                           |
| 10  | 다음 단계            | 기획 문서 6종 생성 후 FEAT-1 프로토타입 개발                                 |

---

## 1. 핵심 원칙

### 1.1 신뢰하되, 검증하라 (Don't Trust, Verify)

AI가 생성한 코드는 반드시 검증해야 합니다:

- [ ] 코드 리뷰: 생성된 코드 직접 확인
- [ ] 테스트 실행: 자동화 테스트 통과 확인
- [ ] 보안 검토: 민감 정보 노출 여부 확인
- [ ] 동작 확인: 실제로 실행하여 기대 동작 확인
- [ ] 신학적 검증: FEAT-1 구문 분석 결과의 신학적 정확도 확인 (개혁신학 관점)

### 1.2 최종 책임은 인간에게

- AI는 도구이고, 최종 결정과 책임은 개발자에게 있습니다
- 이해하지 못하는 코드는 사용하지 않습니다
- 의심스러운 부분은 반드시 질문합니다
- 특히 성경 해석 관련 AI 출력은 검증자 리뷰를 거칩니다

---

## 2. 프로젝트 구조

### 2.1 디렉토리 구조

```
beeSvat/
+-- contracts/                    # API 계약 (공유)
|   +-- types.ts                 # 공통 타입 정의
|   +-- auth.contract.ts         # FEAT-0: 인증 API 계약
|   +-- analysis.contract.ts     # FEAT-1: 구문 분석 API 계약
|   +-- verb.contract.ts         # FEAT-2: 원어 동사 API 계약
|   +-- meditation.contract.ts   # FEAT-3: 묵상 노트 API 계약
|   +-- bible.contract.ts        # FEAT-4: 성경 본문 API 계약
|
+-- prisma/                       # Prisma 스키마 및 마이그레이션
|   +-- schema.prisma
|   +-- migrations/
|   +-- seed.ts
|
+-- src/
|   +-- app/                      # Next.js App Router
|   |   +-- api/                  # API Route Handlers (백엔드 역할)
|   |   |   +-- v1/
|   |   |       +-- auth/
|   |   |       |   +-- register/route.ts
|   |   |       |   +-- login/route.ts
|   |   |       |   +-- refresh/route.ts
|   |   |       |   +-- logout/route.ts
|   |   |       |   +-- me/route.ts
|   |   |       +-- analysis/
|   |   |       |   +-- route.ts
|   |   |       |   +-- [id]/
|   |   |       |       +-- route.ts
|   |   |       |       +-- rating/route.ts
|   |   |       +-- verbs/
|   |   |       |   +-- [word]/
|   |   |       |       +-- route.ts
|   |   |       |       +-- references/route.ts
|   |   |       +-- meditations/
|   |   |       |   +-- route.ts
|   |   |       |   +-- generate/route.ts
|   |   |       |   +-- [id]/route.ts
|   |   |       +-- bible/
|   |   |           +-- today/route.ts
|   |   |           +-- search/route.ts
|   |   |           +-- [book]/[chapter]/[verse]/route.ts
|   |   +-- (auth)/               # FEAT-0: 인증 페이지
|   |   |   +-- login/page.tsx
|   |   |   +-- register/page.tsx
|   |   |   +-- onboarding/page.tsx
|   |   +-- analysis/             # FEAT-1: 구문 분석 페이지
|   |   +-- meditation/           # FEAT-3: 묵상 노트 페이지
|   |   +-- settings/             # FEAT-0: 설정 페이지
|   |   +-- layout.tsx
|   |   +-- page.tsx              # 메인 페이지
|   +-- components/               # 재사용 컴포넌트
|   |   +-- ui/
|   |   +-- analysis/
|   |   +-- bible/
|   |   +-- meditation/
|   |   +-- auth/
|   |   +-- onboarding/
|   |   +-- layout/
|   +-- hooks/                    # 커스텀 훅
|   +-- lib/                      # 유틸리티, 설정
|   +-- server/                   # 서버 전용 코드
|   |   +-- services/             # 비즈니스 로직
|   |   |   +-- auth.service.ts
|   |   |   +-- analysis.service.ts
|   |   |   +-- ai.service.ts
|   |   |   +-- verb.service.ts
|   |   |   +-- meditation.service.ts
|   |   |   +-- bible.service.ts
|   |   +-- schemas/              # Zod 검증 스키마
|   |   +-- middleware/           # API 미들웨어 유틸리티
|   |   +-- prompts/              # AI 프롬프트 템플릿
|   |   +-- config/               # 서버 설정
|   |   +-- utils/                # 서버 유틸리티
|   +-- services/                 # API 호출 서비스 (클라이언트)
|   +-- stores/                   # Zustand 상태 관리
|   +-- types/                    # TypeScript 타입
|   +-- styles/                   # 글로벌 스타일
|   +-- mocks/                    # MSW Mock (개발용)
|   |   +-- handlers/
|   |   +-- data/
|   +-- __tests__/                # 테스트
|       +-- server/               # 서버 로직 테스트
|       |   +-- unit/
|       |   +-- integration/
|       +-- components/           # 컴포넌트 테스트
|       +-- hooks/                # 훅 테스트
|       +-- app/                  # 페이지 테스트
|
+-- e2e/                          # Playwright E2E 테스트
+-- docs/
|   +-- planning/                # 기획 문서 (소크라테스 산출물)
|
+-- public/                       # 정적 파일
+-- docker-compose.yml
+-- .env.example
+-- .gitignore
+-- package.json
+-- next.config.ts
+-- tailwind.config.ts
+-- tsconfig.json
+-- vitest.config.ts
+-- playwright.config.ts
```

### 2.2 네이밍 규칙

| 대상                  | 규칙                   | 예시                        |
| --------------------- | ---------------------- | --------------------------- |
| 파일 (React 컴포넌트) | PascalCase             | `AnalysisResult.tsx`        |
| 파일 (훅)             | camelCase + use 접두사 | `useAnalysis.ts`            |
| 파일 (유틸/서비스)    | camelCase              | `analysisService.ts`        |
| 파일 (라우트)         | Next.js 규칙           | `route.ts`                  |
| 파일 (스키마)         | dot notation           | `analysis.schema.ts`        |
| 파일 (테스트)         | 원본명 + .test         | `analysis.service.test.ts`  |
| React 컴포넌트        | PascalCase             | `AnalysisResult`            |
| 함수/변수             | camelCase              | `getAnalysisById`           |
| 상수                  | UPPER_SNAKE_CASE       | `MAX_RETRY_COUNT`           |
| 타입/인터페이스       | PascalCase             | `AnalysisResult`            |
| Enum 값               | UPPER_SNAKE_CASE       | `ANALYSIS_STATUS.COMPLETED` |
| CSS 클래스            | Tailwind 유틸리티      | `bg-primary text-white`     |
| DB 테이블             | snake_case (복수)      | `analyses`                  |
| DB 컬럼               | snake_case             | `verse_start`               |
| API 경로              | kebab-case             | `/api/v1/analysis`          |
| 환경 변수             | UPPER_SNAKE_CASE       | `DATABASE_URL`              |

### 2.3 FEAT 식별자 규칙

모든 코드에 FEAT 식별자를 주석으로 표기합니다:

```typescript
// FEAT-1: 구문 분석 결과 표시 컴포넌트
export function AnalysisResult({ data }: AnalysisResultProps) {
  // ...
}
```

```typescript
// FEAT-0: 인증 미들웨어 (Next.js Route Handler용)
export async function authMiddleware(request: NextRequest) {
  // ...
}
```

---

## 3. 아키텍처 원칙

### 3.1 뼈대 먼저 (Skeleton First)

1. 전체 구조를 먼저 잡고
2. 빈 함수/컴포넌트로 스켈레톤 생성
3. 하나씩 구현 채워나가기

**FEAT 순서:**

```
FEAT-0 (온보딩/인증) -> FEAT-1 (구문 분석, MVP 핵심) -> FEAT-4 (본문 가져오기) -> FEAT-2 (원어 분석) -> FEAT-3 (묵상 노트)
```

### 3.2 작은 모듈로 분해

- 한 파일에 200줄 이하 권장
- 한 함수에 50줄 이하 권장
- 한 컴포넌트에 100줄 이하 권장
- AI 프롬프트 템플릿은 별도 파일로 분리

### 3.3 관심사 분리

**프론트엔드:**
| 레이어 | 역할 | 위치 |
|--------|------|------|
| UI | 화면 표시 | components/ |
| 페이지 | 라우팅, 레이아웃 | app/ |
| 상태 | 클라이언트 데이터 관리 | stores/ |
| 서비스 | API 통신 | services/ |
| 훅 | 재사용 로직 | hooks/ |
| 유틸 | 순수 함수 | lib/ |

**백엔드 (서버 사이드):**
| 레이어 | 역할 | 위치 |
|--------|------|------|
| Route Handler | HTTP 요청 처리 | app/api/ |
| 서비스 | 비즈니스 로직 | server/services/ |
| 스키마 | 검증 | server/schemas/ |
| 미들웨어 | 횡단 관심사 | server/middleware/, middleware.ts |
| 유틸 | 공통 함수 | server/utils/ |

### 3.4 에러 처리 원칙

- try-catch를 남용하지 않음 (에러가 나면 프로그램이 멈춰도 됨)
- 에러 경계(Error Boundary)는 페이지 레벨에서만 사용
- API 에러는 통일된 에러 응답 형식 준수 (TRD 섹션 8.2 참조)
- AI 분석 실패 시 명확한 에러 메시지 반환

---

## 4. AI 소통 원칙

### 4.1 하나의 채팅 = 하나의 작업

- 한 번에 하나의 명확한 작업만 요청
- 작업 완료 후 다음 작업 진행
- 컨텍스트가 길어지면 새 대화 시작

### 4.2 컨텍스트 명시

**좋은 예:**

> "01-prd.md의 FEAT-1 사용자 스토리를 구현해주세요.
> 04-database-design.md의 ANALYSIS 엔티티를 참조하고,
> 02-trd.md의 기술 스택과 API 설계를 따라주세요."

**나쁜 예:**

> "분석 기능 만들어줘"

### 4.3 기존 코드 재사용

- 새로 만들기 전에 기존 코드 확인 요청
- 중복 코드 방지
- 일관성 유지
- contracts/ 디렉토리의 계약 파일 항상 참조

### 4.4 프롬프트 템플릿

```
## 작업
FEAT-{번호}: {작업 설명}

## 참조 문서
- 01-prd.md 섹션 {번호} (사용자 스토리)
- 02-trd.md 섹션 {번호} (기술 사양)
- 04-database-design.md (엔티티 정의)

## 제약 조건
- {지켜야 할 것}

## 예상 결과
- {생성될 파일}
- {기대 동작}
```

---

## 5. 보안 체크리스트

### 5.1 절대 금지

- [ ] 비밀정보 하드코딩 금지 (API 키, 비밀번호, 토큰)
- [ ] .env 파일 커밋 금지
- [ ] SQL 직접 문자열 조합 금지 (Prisma ORM 사용)
- [ ] 사용자 입력 그대로 출력 금지 (XSS)
- [ ] AI API 키를 프론트엔드에 노출 금지

### 5.2 필수 적용

- [ ] 모든 사용자 입력 Zod 스키마로 서버 측 검증
- [ ] 비밀번호 bcrypt 해싱 (cost factor: 12)
- [ ] HTTPS 사용 (프로덕션)
- [ ] CORS 설정 (허용된 도메인만)
- [ ] JWT 인증 필수 (AI 분석 API 포함)
- [ ] Rate Limiting (AI 분석: 분당 10회/사용자)
- [ ] AI 프롬프트 인젝션 방지 (사용자 입력 필터링)

### 5.3 환경 변수 관리

```bash
# .env.example (커밋 O - 구조 참고용)
DATABASE_URL=postgresql://user:password@localhost:5432/beesvat
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# .env (커밋 X - 실제 값)
DATABASE_URL=postgresql://real:real@localhost:5432/beesvat
JWT_SECRET=abc123xyz789...
```

### 5.4 .gitignore 필수 항목

```
node_modules/
.env
.env.local
.env.production
*.log
dist/
.next/
coverage/
prisma/*.db
```

---

## 6. 테스트 워크플로우

### 6.1 즉시 실행 검증

코드 작성 후 바로 테스트:

```bash
# 전체 테스트
npm run test

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# E2E 테스트
npx playwright test
```

### 6.2 FEAT별 테스트 우선순위

| FEAT   | 테스트 유형        | 우선순위 | 설명                              |
| ------ | ------------------ | -------- | --------------------------------- |
| FEAT-0 | Unit + Integration | 높음     | 인증 로직은 보안 상 철저히 테스트 |
| FEAT-1 | Unit + E2E         | 최고     | MVP 핵심, AI 분석 결과 검증 포함  |
| FEAT-2 | Unit               | 중간     | 원어 파싱 로직 정확도 테스트      |
| FEAT-3 | Unit + Integration | 중간     | CRUD 기본 동작 검증               |
| FEAT-4 | Integration        | 낮음     | 외부 연동 모킹 필수               |

### 6.3 오류 로그 공유 규칙

오류 발생 시 AI에게 전달할 정보:

1. 전체 에러 메시지
2. 관련 코드 스니펫
3. 재현 단계
4. 이미 시도한 해결책
5. 관련 FEAT 번호

**예시:**

```
## FEAT-1 에러
TypeError: Cannot read property 'mainVerbs' of undefined

## 코드
const verbs = analysisResult.mainVerbs;  // line 42, AnalysisResult.tsx

## 재현
1. "요한복음 3:16" 입력
2. "구문 분석" 버튼 클릭
3. 결과 화면에서 에러 발생

## 시도한 것
- analysisResult가 undefined인지 확인 -> 로딩 중 접근 문제로 추정
```

---

## 7. Git 워크플로우

### 7.1 브랜치 전략

```
main              # 프로덕션
+-- develop       # 개발 통합
    +-- feature/feat-0-auth            # FEAT-0: 인증
    +-- feature/feat-0-onboarding      # FEAT-0: 온보딩
    +-- feature/feat-1-analysis         # FEAT-1: 구문 분석
    +-- feature/feat-2-verb-analysis   # FEAT-2: 원어 분석
    +-- feature/feat-3-meditation      # FEAT-3: 묵상 노트
    +-- feature/feat-4-bible-fetch     # FEAT-4: 성경 본문
    +-- fix/feat-1-parsing-error       # FEAT-1 관련 버그 수정
```

### 7.2 커밋 메시지

```
<type>(feat-<번호>): <subject>

<body>
```

**타입:**

- `feat`: 새 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서
- `test`: 테스트
- `chore`: 기타 (설정, 의존성 등)

**예시:**

```
feat(feat-1): 성경 구문 분석 API 엔드포인트 추가

- POST /api/v1/analysis 구현
- Zod 스키마 기반 입력 검증
- AI 서비스 연동 (스트리밍 응답)
- 02-trd.md 섹션 8.2 구현 완료
```

```
fix(feat-1): 구문 분석 시 히브리어 동사 파싱 오류 수정

- 히브리어 Hiphil 형태 인식 오류 수정
- 테스트 케이스 추가: 창세기 1:1 분석
```

### 7.3 PR 규칙

- PR 제목: `[FEAT-{번호}] {간결한 설명}`
- PR 본문: 변경 사항, 테스트 결과, 스크린샷 (UI 변경 시)
- 리뷰어: 최소 1명
- 병합 조건: 테스트 통과 + 리뷰 승인

---

## 8. 코드 품질 도구

### 8.1 필수 설정

| 도구      | 설정                 |
| --------- | -------------------- |
| 린터      | ESLint (flat config) |
| 포매터    | Prettier             |
| 타입 체크 | TypeScript strict    |

### 8.2 ESLint 주요 규칙

```javascript
// eslint.config.js (공통)
{
  rules: {
    "no-console": "warn",
    "no-unused-vars": "error",
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
  }
}
```

### 8.3 Prettier 설정

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

### 8.4 TypeScript 설정

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 8.5 Pre-commit 훅

```yaml
# .husky/pre-commit
npm run lint
npm run type-check
npm run test -- --passWithNoTests
```

---

## 9. AI 구문 분석 코드 규칙 (FEAT-1 특화)

### 9.1 프롬프트 관리

- AI 프롬프트는 별도 파일로 관리: `src/server/prompts/`
- 프롬프트 버전 관리: 파일명에 버전 포함 (`analysis-v1.prompt.ts`)
- 프롬프트 변경 시 반드시 테스트 재실행

### 9.2 분석 결과 검증

```typescript
// FEAT-1: 분석 결과 검증 스키마
const analysisResultSchema = z.object({
  structure: z.object({...}),
  explanation: z.string().min(50),
  mainVerbs: z.array(verbSchema).min(1),
  modifiers: z.array(modifierSchema),
  connectors: z.array(connectorSchema),
});
```

### 9.3 원어 데이터 처리

- 히브리어/헬라어 텍스트는 UTF-8 인코딩 필수
- 원어 표기 시 음역(transliteration) 항상 병행
- 문법 용어는 영어/한국어 병기 (예: "Aorist(부정과거)")

---

## Decision Log

| #     | 일자       | 결정 사항                  | 이유                                       |
| ----- | ---------- | -------------------------- | ------------------------------------------ |
| CC-01 | 2026-02-26 | TypeScript strict 모드     | 타입 안정성 최대화, AI 코드 생성 품질 향상 |
| CC-02 | 2026-02-26 | Zod 스키마 BE/FE 공유      | Contract-First 개발, 타입 일관성 보장      |
| CC-03 | 2026-02-26 | FEAT 식별자 주석 규칙      | 코드-기획 문서 추적성 확보, SSOT 원칙      |
| CC-04 | 2026-02-26 | AI 프롬프트 파일 분리 관리 | 프롬프트 변경 추적, 버전 관리, 재현 가능성 |
| CC-05 | 2026-02-26 | try-catch 최소화           | 프로젝트 규칙: 에러 시 프로그램 정지 허용  |
