# beeSvat 배포 가이드

## 문서이력관리

| 버전 | 날짜       | 작성자 | 변경 내용 |
| ---- | ---------- | ------ | --------- |
| 1.0  | 2026-02-26 | Claude | 초기 작성 |

---

## 목차

1. [사전 요구사항](#1-사전-요구사항)
2. [로컬 개발 환경 설정](#2-로컬-개발-환경-설정)
3. [Docker 설정](#3-docker-설정)
4. [Vercel 배포](#4-vercel-배포)
5. [환경 변수 설명](#5-환경-변수-설명)
6. [데이터베이스 마이그레이션](#6-데이터베이스-마이그레이션)
7. [트러블슈팅](#7-트러블슈팅)

---

## 1. 사전 요구사항

- **Node.js** 20+ (LTS 권장)
- **npm** 10+
- **PostgreSQL** 15+
- **OpenAI API Key** (GPT-4o-mini 이상)
- **Git**

## 2. 로컬 개발 환경 설정

### 2.1 프로젝트 클론 및 의존성 설치

```bash
git clone <repository-url>
cd beeSvat
npm install
```

### 2.2 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 실제 값으로 수정합니다:

- `DATABASE_URL`: PostgreSQL 연결 문자열
- `JWT_SECRET`: 최소 32자 이상의 시크릿 키
- `JWT_REFRESH_SECRET`: 리프레시 토큰용 시크릿 키
- `OPENAI_API_KEY`: OpenAI API 키

### 2.3 데이터베이스 설정

```bash
# Docker로 PostgreSQL 실행
docker compose up -d

# Prisma 클라이언트 생성
npm run db:generate

# 데이터베이스 마이그레이션
npm run db:migrate

# (선택) 시드 데이터 삽입
npm run db:seed
```

### 2.4 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000`에서 앱이 실행됩니다.

## 3. Docker 설정

### 3.1 개발용 PostgreSQL

```bash
# 개발 DB 시작 (포트: 5432)
docker compose up -d

# 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f db

# 중지
docker compose down
```

### 3.2 테스트용 PostgreSQL

개발 DB와 충돌하지 않도록 별도 포트(5433)를 사용합니다:

```bash
# 테스트 DB 시작 (포트: 5433)
docker compose -f docker-compose.test.yml up -d

# 테스트 실행 시 DATABASE_URL 예시:
# DATABASE_URL=postgresql://beesvat:beesvat_test@localhost:5433/beesvat_test?schema=public

# 중지
docker compose -f docker-compose.test.yml down
```

## 4. Vercel 배포

### 4.1 사전 준비

1. [Vercel](https://vercel.com) 계정 생성
2. GitHub 저장소 연결
3. PostgreSQL 데이터베이스 준비 (Vercel Postgres, Supabase, Neon 등)

### 4.2 Vercel 프로젝트 설정

1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 선택
3. Framework Preset: **Next.js** (자동 감지)
4. Build 설정은 `vercel.json`에 의해 자동 적용됨

### 4.3 환경 변수 등록

Vercel 대시보드 > Settings > Environment Variables에서 다음 변수를 등록합니다:

| 변수명                | 필수 | 설명                               |
| --------------------- | ---- | ---------------------------------- |
| `DATABASE_URL`        | O    | PostgreSQL 연결 문자열             |
| `JWT_SECRET`          | O    | JWT 액세스 토큰 시크릿 (32자 이상) |
| `JWT_REFRESH_SECRET`  | O    | JWT 리프레시 토큰 시크릿           |
| `OPENAI_API_KEY`      | O    | OpenAI API 키                      |
| `OPENAI_MODEL`        | X    | 사용할 모델 (기본: gpt-4o-mini)    |
| `NEXT_PUBLIC_APP_URL` | O    | 배포된 앱 URL                      |

### 4.4 배포

```bash
# Vercel CLI 설치 (선택)
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

또는 GitHub에 push하면 자동으로 배포됩니다.

### 4.5 배포 리전

`vercel.json`에서 `icn1` (서울) 리전으로 설정되어 있습니다. 한국 사용자를 대상으로 최적의 응답 속도를 제공합니다.

## 5. 환경 변수 설명

### App

| 변수명                | 기본값                  | 설명                                      |
| --------------------- | ----------------------- | ----------------------------------------- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | 앱의 공개 URL. 프론트엔드에서도 접근 가능 |
| `NODE_ENV`            | `development`           | 실행 환경 (development, production, test) |

### Database

| 변수명         | 설명                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL 연결 문자열. 형식: `postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public` |

### JWT

| 변수명                   | 기본값 | 설명                                     |
| ------------------------ | ------ | ---------------------------------------- |
| `JWT_SECRET`             | -      | 액세스 토큰 서명용 시크릿 키 (최소 32자) |
| `JWT_REFRESH_SECRET`     | -      | 리프레시 토큰 서명용 시크릿 키           |
| `JWT_ACCESS_EXPIRES_IN`  | `15m`  | 액세스 토큰 만료 시간                    |
| `JWT_REFRESH_EXPIRES_IN` | `7d`   | 리프레시 토큰 만료 시간                  |

### OpenAI

| 변수명               | 기본값        | 설명                             |
| -------------------- | ------------- | -------------------------------- |
| `OPENAI_API_KEY`     | -             | OpenAI API 키                    |
| `OPENAI_MODEL`       | `gpt-4o-mini` | 사용할 GPT 모델                  |
| `OPENAI_MAX_TOKENS`  | `4000`        | 최대 응답 토큰 수                |
| `OPENAI_TEMPERATURE` | `0.3`         | 응답 온도 (0~1, 낮을수록 결정적) |
| `OPENAI_TIMEOUT_MS`  | `30000`       | API 요청 타임아웃 (밀리초)       |

## 6. 데이터베이스 마이그레이션

### 개발 환경

```bash
# 마이그레이션 생성 및 적용
npm run db:migrate

# 스키마만 동기화 (마이그레이션 파일 생성 없이)
npm run db:push

# Prisma Studio로 데이터 확인
npm run db:studio
```

### 프로덕션 환경

```bash
# Prisma 클라이언트 생성 (빌드 시 자동 실행)
npx prisma generate

# 프로덕션 마이그레이션 적용
npx prisma migrate deploy
```

> Vercel 배포 시 `vercel.json`의 `buildCommand`에 `prisma generate`가 포함되어 있어 자동으로 실행됩니다. 마이그레이션은 별도로 실행해야 합니다.

## 7. 트러블슈팅

### 데이터베이스 연결 실패

**증상**: `Can't reach database server`

**해결**:

1. PostgreSQL이 실행 중인지 확인: `docker compose ps`
2. `DATABASE_URL`이 올바른지 확인
3. 방화벽/네트워크 설정 확인
4. Docker 로그 확인: `docker compose logs db`

### Prisma Client 생성 오류

**증상**: `@prisma/client did not initialize yet`

**해결**:

```bash
npx prisma generate
```

### Vercel 빌드 실패

**증상**: 빌드 중 Prisma 관련 오류

**해결**:

1. `vercel.json`의 `buildCommand`에 `prisma generate`가 포함되어 있는지 확인
2. Vercel 환경 변수에 `DATABASE_URL`이 설정되어 있는지 확인
3. 데이터베이스가 Vercel 서버에서 접근 가능한지 확인

### OpenAI API 오류

**증상**: `401 Unauthorized` 또는 `429 Too Many Requests`

**해결**:

1. `OPENAI_API_KEY`가 올바른지 확인
2. API 키의 사용량 한도 확인
3. 타임아웃 발생 시 `OPENAI_TIMEOUT_MS` 값 증가

### JWT 인증 오류

**증상**: `JWSInvalid` 또는 토큰 검증 실패

**해결**:

1. `JWT_SECRET`이 최소 32자 이상인지 확인
2. 프로덕션과 개발 환경의 시크릿 키가 다른지 확인
3. 토큰 만료 시간 설정 확인

### 포트 충돌

**증상**: `EADDRINUSE: address already in use`

**해결**:

```bash
# 사용 중인 포트 확인 (Windows)
netstat -ano | findstr :3000

# 사용 중인 포트 확인 (Linux/Mac)
lsof -i :3000

# 다른 포트로 실행
npm run dev -- --port 3001
```
