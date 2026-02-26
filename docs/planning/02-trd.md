# TRD (기술 요구사항 정의서) - beeSvat

> 개발자/AI 코딩 파트너가 참조하는 기술 문서입니다.
> 기술 표현을 사용하되, "왜 이 선택인지"를 함께 설명합니다.

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

## 1. 시스템 아키텍처

### 1.1 고수준 아키텍처

```
+------------------+     +------------------+     +------------------+
|     Client       |---->|     Server       |---->|    Database      |
|  (Next.js App)   |     | (Next.js Route   |     |  (PostgreSQL)    |
|                  |     |   Handlers)      |     |                  |
+------------------+     +------------------+     +------------------+
                               |
                               v
                         +------------------+
                         |    AI Service    |
                         | (구문 분석 엔진) |
                         +------------------+
```

### 1.2 컴포넌트 설명

| 컴포넌트                         | 역할                                                | 왜 이 선택?                                                       |
| -------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- |
| Frontend (Next.js)               | 사용자 인터페이스, SSR/SSG, 반응형 웹앱             | React 생태계 활용, SEO 지원, App Router로 최신 패턴 적용          |
| Backend (Next.js Route Handlers) | API Route Handlers, 서버사이드 로직, AI 서비스 연동 | 프론트엔드와 동일 프레임워크, 단일 배포, App Router 내장 API 지원 |
| Database (PostgreSQL)            | 사용자 데이터, 분석 결과 저장, 성경 본문 캐시       | 안정적 관계형 DB, JSONB 지원으로 유연한 분석 결과 저장            |
| AI Service                       | 성경 구문 분석, 원어 파싱, 해설 생성                | LLM 기반 분석으로 복잡한 구문 처리 가능                           |

### 1.3 통신 흐름

```
[Client] --Same-Origin--> [Next.js Route Handlers] --Internal--> [AI Service]
                                    |
                                    +--Prisma ORM--> [PostgreSQL]
```

- Client-Server: Next.js 내부 라우팅 (Same-Origin)
- Server-AI: 내부 서비스 호출 (LLM API)
- Server-DB: Prisma ORM

---

## 2. 권장 기술 스택

### 2.1 프론트엔드

| 항목            | 선택                     | 이유                                             | 벤더 락인 리스크          |
| --------------- | ------------------------ | ------------------------------------------------ | ------------------------- |
| 프레임워크      | Next.js 14+ (App Router) | SSR/SSG 지원, React 생태계, 반응형 웹앱 최적화   | 중간 (Vercel 종속 가능성) |
| 언어            | TypeScript 5+            | 타입 안정성, 개발 생산성, AI 코드 생성 품질 향상 | -                         |
| 스타일링        | Tailwind CSS 3+          | 유틸리티 우선, 빠른 UI 개발, 반응형 지원         | 낮음                      |
| 상태관리        | Zustand                  | 경량, 보일러플레이트 최소, React 친화적          | 낮음                      |
| HTTP 클라이언트 | Axios                    | 인터셉터 지원, 에러 처리 편의성, 타입 안정성     | 낮음                      |
| 폼 관리         | React Hook Form + Zod    | 성능 최적화, 스키마 기반 검증                    | 낮음                      |

### 2.2 백엔드

| 항목       | 선택                                | 이유                                                  | 벤더 락인 리스크 |
| ---------- | ----------------------------------- | ----------------------------------------------------- | ---------------- |
| 프레임워크 | Next.js Route Handlers (App Router) | 프론트엔드와 통합, 단일 배포, 서버 컴포넌트 활용 가능 | 중간 (Vercel)    |
| 언어       | TypeScript 5+ (Node.js 20+)         | 프론트엔드와 언어 통일, 타입 공유 가능                | -                |
| ORM        | Prisma                              | 타입 안전한 쿼리, 마이그레이션 관리, 직관적 스키마    | 중간             |
| 검증       | Zod                                 | 프론트엔드와 스키마 공유, 런타임 타입 검증            | 낮음             |
| AI 연동    | OpenAI SDK / Anthropic SDK          | 구문 분석 엔진, 프롬프트 기반 분석                    | 중간 (API 의존)  |

### 2.3 데이터베이스

| 항목    | 선택                | 이유                                                     |
| ------- | ------------------- | -------------------------------------------------------- |
| 메인 DB | PostgreSQL 15+      | ACID 보장, JSONB로 유연한 분석 결과 저장, 전문 검색 지원 |
| 캐시    | Redis (v2에서 도입) | 분석 결과 캐싱, 세션 관리 (MVP에서는 인메모리 캐시)      |

### 2.4 인프라

| 항목     | 선택                    | 이유                                                       |
| -------- | ----------------------- | ---------------------------------------------------------- |
| 컨테이너 | Docker + Docker Compose | 로컬 개발 환경 일관성, 배포 편의성                         |
| 호스팅   | Vercel (Full-Stack)     | Next.js 최적화 호스팅, 프론트/백 통합 배포, 무료 티어 활용 |
| AI API   | OpenAI / Anthropic      | 구문 분석용 LLM API                                        |

---

## 3. 비기능 요구사항

### 3.1 성능

| 항목               | 요구사항                 | 측정 방법               |
| ------------------ | ------------------------ | ----------------------- |
| 페이지 로딩        | < 3s (FCP, 모바일 3G)    | Lighthouse              |
| API 응답 (일반)    | < 500ms (P95)            | API 모니터링            |
| API 응답 (AI 분석) | < 5s (P95), 첫 토큰 < 2s | API 모니터링 + 스트리밍 |
| 번들 사이즈        | < 300KB (초기 로드)      | webpack-bundle-analyzer |

### 3.2 보안

| 항목          | 요구사항                                       |
| ------------- | ---------------------------------------------- |
| 인증          | JWT (Access Token: 15분) + Refresh Token (7일) |
| 비밀번호      | bcrypt 해싱 (cost factor: 12)                  |
| HTTPS         | 필수 (모든 통신 암호화)                        |
| 입력 검증     | Zod 스키마 기반 서버 측 검증 필수              |
| CORS          | 허용된 도메인만 접근                           |
| Rate Limiting | AI 분석 API: 분당 10회/사용자                  |

### 3.3 확장성

| 항목         | 현재 (MVP) | 목표 (v2)         |
| ------------ | ---------- | ----------------- |
| 동시 사용자  | 100명      | 1,000명           |
| 데이터 용량  | 1GB        | 10GB              |
| AI 분석 처리 | 순차 처리  | 큐 기반 병렬 처리 |

---

## 4. 외부 API 연동

### 4.1 인증

| 서비스       | 용도             | 필수/선택 | 연동 방식        |
| ------------ | ---------------- | --------- | ---------------- |
| Google OAuth | 소셜 로그인      | 선택 (v2) | OAuth 2.0        |
| 이메일 인증  | 이메일 가입 확인 | 필수      | SMTP / 인증 코드 |

### 4.2 기타 서비스

| 서비스                 | 용도                    | 필수/선택 | 비고                       | FEAT                   |
| ---------------------- | ----------------------- | --------- | -------------------------- | ---------------------- |
| OpenAI / Anthropic API | 성경 구문 분석 AI 엔진  | 필수      | FEAT-1 핵심 의존성         | FEAT-1, FEAT-2, FEAT-3 |
| 두란노 QT              | 오늘의 QT 본문 가져오기 | 선택 (v2) | 연동 가능성 사전 조사 필요 | FEAT-4                 |

---

## 5. 접근제어 및 권한 모델

### 5.1 역할 정의

| 역할     | 설명        | 권한                                         |
| -------- | ----------- | -------------------------------------------- |
| Guest    | 비로그인    | 앱 소개 페이지 열람만 가능                   |
| User     | 일반 사용자 | 구문 분석 요청, 묵상 노트 CRUD (본인 데이터) |
| Reviewer | 검증자      | 분석 결과 검토/수정 권한 추가                |
| Admin    | 관리자      | 전체 접근, 사용자 관리, 시스템 설정          |

### 5.2 권한 매트릭스

| 리소스              | Guest | User     | Reviewer | Admin |
| ------------------- | ----- | -------- | -------- | ----- |
| 구문 분석 요청      | -     | O        | O        | O     |
| 분석 결과 조회      | -     | O (본인) | O (전체) | O     |
| 묵상 노트 CRUD      | -     | O (본인) | O (본인) | O     |
| 분석 결과 검증/수정 | -     | -        | O        | O     |
| 사용자 관리         | -     | -        | -        | O     |

---

## 6. 데이터 생명주기

### 6.1 원칙

- **최소 수집**: 묵상에 필요한 데이터만 수집
- **명시적 동의**: 개인정보 수집 전 동의
- **보존 기한**: 목적 달성 후 삭제

### 6.2 데이터 흐름

```
수집 -> 저장 -> 사용 -> 보관 -> 삭제/익명화
```

| 데이터 유형    | 보존 기간    | 삭제/익명화                               |
| -------------- | ------------ | ----------------------------------------- |
| 계정 정보      | 탈퇴 후 30일 | 완전 삭제                                 |
| 분석 요청 로그 | 1년          | 익명화                                    |
| 묵상 노트      | 계정과 동일  | 계정 삭제 시 함께 삭제                    |
| 분석 결과 캐시 | 영구         | 익명화된 상태로 보관 (서비스 품질 향상용) |

---

## 7. 테스트 전략 (Contract-First TDD)

### 7.1 개발 방식: Contract-First Development

본 프로젝트는 **계약 우선 개발(Contract-First Development)** 방식을 채택합니다.
단일 코드베이스에서 서버/클라이언트 코드를 분리하면서도 통합 시 호환성을 보장합니다.

```
+-------------------------------------------------------------+
|                    Contract-First 흐름                        |
+-------------------------------------------------------------+
|                                                               |
|  1. 계약 정의 (Phase 0)                                      |
|     +-- API 계약: contracts/*.contract.ts                    |
|     +-- 서버 스키마: src/server/schemas/*.ts                 |
|     +-- 타입 동기화: Zod 스키마 공유                          |
|                                                               |
|  2. 테스트 선행 작성 (RED)                                    |
|     +-- API 테스트: src/__tests__/api/**/*.test.ts           |
|     +-- 컴포넌트 테스트: src/__tests__/**/*.test.ts          |
|     +-- 모든 테스트가 실패하는 상태 (정상)                    |
|                                                               |
|  3. Mock 생성 (클라이언트 독립 개발용)                        |
|     +-- MSW 핸들러: src/mocks/handlers/*.ts                  |
|                                                               |
|  4. 병렬 구현 (RED -> GREEN)                                  |
|     +-- Route Handlers: 테스트 통과 목표로 구현               |
|     +-- 클라이언트: Mock API로 개발 -> 나중에 실제 API 연결   |
|                                                               |
|  5. 통합 검증                                                 |
|     +-- Mock 제거 -> E2E 테스트                               |
|                                                               |
+-------------------------------------------------------------+
```

### 7.2 테스트 피라미드

| 레벨        | 도구         | 커버리지 목표  | 위치                       |
| ----------- | ------------ | -------------- | -------------------------- |
| Unit        | Vitest       | >= 80%         | src/**tests**/unit/        |
| Integration | Vitest + MSW | Critical paths | src/**tests**/integration/ |
| E2E         | Playwright   | Key user flows | e2e/                       |

### 7.3 테스트 도구

**서버 (Route Handlers):**
| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 |
| Next.js Route Handler 테스트 유틸리티 | API 엔드포인트 테스트 |
| Prisma Client Mock | DB 모킹 |

**클라이언트 (React 컴포넌트):**
| 도구 | 용도 |
|------|------|
| Vitest | 테스트 실행 |
| React Testing Library | 컴포넌트 테스트 |
| MSW (Mock Service Worker) | API 모킹 |
| Playwright | E2E 테스트 |

### 7.4 계약 파일 구조

```
beeSvat/
+-- contracts/                    # API 계약 (서버/클라이언트 공유)
|   +-- types.ts                 # 공통 타입 정의
|   +-- auth.contract.ts         # FEAT-0: 인증 API 계약
|   +-- analysis.contract.ts     # FEAT-1: 구문 분석 API 계약
|   +-- verb.contract.ts         # FEAT-2: 원어 동사 분석 API 계약
|   +-- meditation.contract.ts   # FEAT-3: 묵상 노트 API 계약
|   +-- bible.contract.ts        # FEAT-4: 성경 본문 API 계약
|
+-- prisma/
|   +-- schema.prisma            # Prisma 스키마
|   +-- migrations/              # DB 마이그레이션
|   +-- seed.ts                  # 시드 데이터
|
+-- src/
|   +-- server/
|   |   +-- schemas/             # Zod 스키마 (계약과 동기화)
|   |   |   +-- auth.schema.ts
|   |   |   +-- analysis.schema.ts
|   |   |   +-- meditation.schema.ts
|   |   +-- services/            # 비즈니스 로직
|   |   +-- middleware/          # 서버 미들웨어
|   +-- mocks/
|   |   +-- handlers/            # MSW Mock 핸들러
|   |   |   +-- auth.ts
|   |   |   +-- analysis.ts
|   |   +-- data/                # Mock 데이터
|   +-- __tests__/
|       +-- api/                 # API Route Handler 테스트 (계약 기반)
|       |   +-- auth.test.ts
|       |   +-- analysis.test.ts
|       +-- components/          # 컴포넌트 테스트
|
+-- e2e/                         # E2E 테스트
```

### 7.5 TDD 사이클

모든 기능 개발은 다음 사이클을 따릅니다:

```
RED    -> 실패하는 테스트 먼저 작성
GREEN  -> 테스트를 통과하는 최소한의 코드 구현
REFACTOR -> 테스트 통과 유지하며 코드 개선
```

### 7.6 품질 게이트

**병합 전 필수 통과:**

- [ ] 모든 단위 테스트 통과
- [ ] 커버리지 >= 80%
- [ ] 린트 통과 (ESLint)
- [ ] 타입 체크 통과 (tsc --noEmit)
- [ ] E2E 테스트 통과 (해당 기능)

**검증 명령어:**

```bash
# 전체 테스트
npm run test -- --coverage

# 린트
npm run lint

# 타입 체크
npx tsc --noEmit

# E2E
npx playwright test
```

---

## 8. API 설계 원칙

### 8.1 RESTful 규칙

| 메서드 | 용도      | 예시                            |
| ------ | --------- | ------------------------------- |
| GET    | 조회      | GET /api/v1/analysis/{id}       |
| POST   | 생성      | POST /api/v1/analysis           |
| PUT    | 전체 수정 | PUT /api/v1/meditations/{id}    |
| PATCH  | 부분 수정 | PATCH /api/v1/meditations/{id}  |
| DELETE | 삭제      | DELETE /api/v1/meditations/{id} |

### 8.2 주요 API 엔드포인트

**FEAT-0: 인증**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/v1/auth/register | 회원가입 |
| POST | /api/v1/auth/login | 로그인 |
| POST | /api/v1/auth/refresh | 토큰 갱신 |
| POST | /api/v1/auth/logout | 로그아웃 |
| GET | /api/v1/auth/me | 내 정보 조회 |

**FEAT-1: 구문 분석**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/v1/analysis | 구문 분석 요청 |
| GET | /api/v1/analysis/{id} | 분석 결과 조회 |
| GET | /api/v1/analysis | 분석 이력 목록 |

**FEAT-2: 원어 동사 분석 (v2)**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/v1/verbs/{word} | 원어 동사 상세 분석 |
| GET | /api/v1/verbs/{word}/references | 동일 원어 참조 구절 |

**FEAT-3: 묵상 노트 (v2)**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/v1/meditations | 묵상 노트 생성 |
| GET | /api/v1/meditations | 묵상 노트 목록 |
| GET | /api/v1/meditations/{id} | 묵상 노트 상세 |
| PUT | /api/v1/meditations/{id} | 묵상 노트 수정 |
| DELETE | /api/v1/meditations/{id} | 묵상 노트 삭제 |
| POST | /api/v1/meditations/generate | 묵상 노트 자동 생성 |

**FEAT-4: 성경 본문 (v2)**
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/v1/bible/today | 오늘의 QT 본문 |
| GET | /api/v1/bible/search | 성경 구절 검색 |
| GET | /api/v1/bible/{book}/{chapter}/{verse} | 특정 구절 조회 |

### 8.3 응답 형식

**성공 응답:**

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "total": 100
  }
}
```

**에러 응답:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "입력 형식이 올바르지 않습니다.",
    "details": [
      { "field": "passage", "message": "성경 구절 형식으로 입력하세요 (예: 요한복음 3:16)" }
    ]
  }
}
```

### 8.4 API 버저닝

| 방식     | 예시                                            | 채택 여부   |
| -------- | ----------------------------------------------- | ----------- |
| URL 경로 | /api/v1/analysis                                | 채택 (권장) |
| 헤더     | Accept: application/vnd.beesvat+json; version=1 | 미채택      |

---

## 9. 병렬 개발 지원 (Git Worktree)

### 9.1 개요

기능(Feature) 단위로 독립된 환경에서 병렬 개발할 때 Git Worktree를 사용합니다.
단일 코드베이스이므로 BE/FE 분리 없이 기능별로 Worktree를 생성합니다.

### 9.2 Worktree 구조

```
projects/
+-- beeSvat/                    # 메인 (main 브랜치)
+-- beeSvat-auth/               # Worktree: feature/feat-0-auth
+-- beeSvat-analysis/           # Worktree: feature/feat-1-analysis
+-- beeSvat-verb/               # Worktree: feature/feat-2-verb
```

### 9.3 명령어

```bash
# Worktree 생성 (기능 단위)
git worktree add ../beeSvat-auth -b feature/feat-0-auth
git worktree add ../beeSvat-analysis -b feature/feat-1-analysis
git worktree add ../beeSvat-verb -b feature/feat-2-verb

# 각 Worktree에서 독립 작업
cd ../beeSvat-auth && npm run test
cd ../beeSvat-analysis && npm run test

# 테스트 통과 후 병합
git checkout main
git merge --no-ff feature/feat-0-auth
git merge --no-ff feature/feat-1-analysis

# Worktree 정리
git worktree remove ../beeSvat-auth
git worktree remove ../beeSvat-analysis
```

### 9.4 병합 규칙

| 조건                | 병합 가능 |
| ------------------- | --------- |
| 단위 테스트 통과    | 필수      |
| 커버리지 >= 80%     | 필수      |
| 린트/타입 체크 통과 | 필수      |
| E2E 테스트 통과     | 권장      |

---

## Decision Log

| #    | 일자       | 결정 사항                                  | 이유                                                                                         |
| ---- | ---------- | ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| T-01 | 2026-02-26 | ORM: Prisma 선택                           | 타입 안전성, 마이그레이션 관리 편의성, TypeScript 친화적                                     |
| T-02 | 2026-02-26 | AI 분석 응답: 스트리밍 방식                | 5초 이상 소요 가능한 분석 결과를 점진적으로 표시하여 UX 개선                                 |
| T-03 | 2026-02-26 | Next.js Full-Stack 단일 코드베이스         | 프론트/백 통합으로 배포 단순화, Zod 스키마 직접 공유, 타입 일관성 극대화                     |
| T-04 | 2026-02-26 | Contract-First TDD                         | 서버/클라이언트 코드 분리 개발 시 통합 호환성 보장                                           |
| T-05 | 2026-02-26 | Next.js Route Handlers 채택 (Express 대신) | 별도 백엔드 서버 불필요, Vercel 단일 배포, App Router 내장 API 지원, 서버 컴포넌트 활용 가능 |
