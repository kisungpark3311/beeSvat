/**
 * contracts/types.ts - beeSvat 공유 타입 및 API 계약
 *
 * 서버와 클라이언트 간 공유되는 공통 타입 정의.
 * 이 파일은 빌드 스텝 없이 직접 import됩니다.
 */

// FEAT-0: API 공통 응답 타입
export interface ApiResponse<T = unknown> {
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// FEAT-0: Health Check
export interface HealthCheck {
  status: string;
  name: string;
}
