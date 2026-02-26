import { z } from 'zod';

// FEAT-0: Authentication API Contract

// === Request Schemas ===

export const registerRequestSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(50, '닉네임은 50자 이하여야 합니다'),
});

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

// === Response Types ===

export interface AuthUser {
  id: string;
  email: string;
  nickname: string;
  role: string;
  profileImage: string | null;
}

export interface RegisterResponse {
  user: Omit<AuthUser, 'profileImage'>;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
}

export interface MeResponse {
  id: string;
  email: string;
  nickname: string;
  role: string;
  profileImage: string | null;
  createdAt: string;
}

// === Inferred Request Types ===

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type LogoutRequest = z.infer<typeof logoutRequestSchema>;
