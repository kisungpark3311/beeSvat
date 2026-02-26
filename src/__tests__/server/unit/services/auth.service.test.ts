// IMPORTANT: Import prismaMock BEFORE auth.service to activate the mock
import { getMockPrisma } from '@/__tests__/utils/prismaMock';
import type { MockPrismaClient } from '@/__tests__/utils/prismaMock';
import { createTestUser } from '@/__tests__/utils/testHelpers';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// FEAT-0: Auth service unit tests

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock jose
vi.mock('jose', () => ({
  SignJWT: vi.fn().mockImplementation(() => {
    const builder = {
      setProtectedHeader: vi.fn().mockReturnThis(),
      setIssuedAt: vi.fn().mockReturnThis(),
      setExpirationTime: vi.fn().mockReturnThis(),
      sign: vi.fn().mockResolvedValue('mock-token'),
    };
    return builder;
  }),
  jwtVerify: vi.fn(),
}));

// Mock jwt config
vi.mock('@/server/config/jwt.config', () => ({
  jwtConfig: {
    accessSecret: new TextEncoder().encode('test-access-secret'),
    refreshSecret: new TextEncoder().encode('test-refresh-secret'),
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
    algorithm: 'HS256' as const,
  },
}));

import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';
import { register, login, refresh, logout, getMe } from '@/server/services/auth.service';
import { AuthError } from '@/server/middleware/auth.middleware';

const mockBcrypt = vi.mocked(bcrypt);
const mockJwtVerify = vi.mocked(jwtVerify);

describe('AuthService', () => {
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    mockPrisma = getMockPrisma();
  });

  // =========================================
  // register
  // =========================================
  describe('회원가입 (register)', () => {
    const registerData = {
      email: 'new@beesvat.com',
      password: 'password123',
      nickname: '새사용자',
    };

    it('성공적으로 회원가입하고 토큰을 반환한다', async () => {
      const createdUser = createTestUser({
        id: 'new-user-id',
        email: registerData.email,
        nickname: registerData.nickname,
      });

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
      mockPrisma.user.create.mockResolvedValue(createdUser);
      mockPrisma.authToken.create.mockResolvedValue({} as never);

      const result = await register(registerData);

      expect(result.user.id).toBe('new-user-id');
      expect(result.user.email).toBe(registerData.email);
      expect(result.user.nickname).toBe(registerData.nickname);
      expect(result.user.role).toBe('user');
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.password, 12);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          passwordHash: 'hashed-password',
          nickname: registerData.nickname,
        },
      });
    });

    it('이메일 중복 시 409 에러를 던진다', async () => {
      const existingUser = createTestUser({ email: registerData.email });
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      await expect(register(registerData)).rejects.toThrow(AuthError);
      await expect(register(registerData)).rejects.toThrow('이미 사용 중인 이메일입니다');

      // Verify statusCode
      try {
        await register(registerData);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).statusCode).toBe(409);
      }
    });

    it('비밀번호를 bcrypt cost factor 12로 해싱한다', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashed-pw' as never);
      mockPrisma.user.create.mockResolvedValue(createTestUser({ email: registerData.email }));
      mockPrisma.authToken.create.mockResolvedValue({} as never);

      await register(registerData);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerData.password, 12);
    });
  });

  // =========================================
  // login
  // =========================================
  describe('로그인 (login)', () => {
    const loginData = {
      email: 'test@beesvat.com',
      password: 'password123',
    };

    it('성공적으로 로그인하고 사용자 정보와 토큰을 반환한다', async () => {
      const user = createTestUser({
        email: loginData.email,
        passwordHash: '$2a$12$hashedpassword',
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockPrisma.authToken.create.mockResolvedValue({} as never);

      const result = await login(loginData);

      expect(result.user.id).toBe(user.id);
      expect(result.user.email).toBe(user.email);
      expect(result.user.nickname).toBe(user.nickname);
      expect(result.user.role).toBe(user.role);
      expect(result.user.profileImage).toBe(user.profileImage);
      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
    });

    it('존재하지 않는 이메일로 로그인 시 401 에러를 던진다', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(login(loginData)).rejects.toThrow(AuthError);

      try {
        await login(loginData);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('이메일 또는 비밀번호가 올바르지 않습니다');
        expect((e as AuthError).statusCode).toBe(401);
      }
    });

    it('비밀번호가 틀린 경우 401 에러를 던진다', async () => {
      const user = createTestUser({
        email: loginData.email,
        passwordHash: '$2a$12$hashedpassword',
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(login(loginData)).rejects.toThrow(AuthError);

      try {
        await login(loginData);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('이메일 또는 비밀번호가 올바르지 않습니다');
        expect((e as AuthError).statusCode).toBe(401);
      }
    });
  });

  // =========================================
  // refresh
  // =========================================
  describe('토큰 갱신 (refresh)', () => {
    const refreshTokenValue = 'valid-refresh-token';

    it('성공적으로 토큰을 갱신하고 새 토큰 쌍을 반환한다', async () => {
      mockJwtVerify.mockResolvedValue({
        payload: { sub: 'user-id-1', type: 'refresh' },
        protectedHeader: { alg: 'HS256' },
      } as never);

      mockPrisma.authToken.findUnique.mockResolvedValue({
        id: 'token-id-1',
        userId: 'user-id-1',
        refreshToken: refreshTokenValue,
        expiresAt: new Date(),
        createdAt: new Date(),
      });
      mockPrisma.authToken.delete.mockResolvedValue({} as never);
      mockPrisma.authToken.create.mockResolvedValue({} as never);

      const result = await refresh(refreshTokenValue);

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(mockPrisma.authToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-id-1' },
      });
    });

    it('유효하지 않은 리프레시 토큰으로 갱신 시 401 에러를 던진다', async () => {
      mockJwtVerify.mockRejectedValue(new Error('invalid token'));

      await expect(refresh('invalid-token')).rejects.toThrow(AuthError);

      try {
        await refresh('invalid-token');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('유효하지 않은 리프레시 토큰입니다');
        expect((e as AuthError).statusCode).toBe(401);
      }
    });

    it('DB에 저장되지 않은 리프레시 토큰으로 갱신 시 401 에러를 던진다', async () => {
      mockJwtVerify.mockResolvedValue({
        payload: { sub: 'user-id-1', type: 'refresh' },
        protectedHeader: { alg: 'HS256' },
      } as never);

      mockPrisma.authToken.findUnique.mockResolvedValue(null);

      await expect(refresh(refreshTokenValue)).rejects.toThrow(AuthError);

      try {
        await refresh(refreshTokenValue);
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('유효하지 않은 리프레시 토큰입니다');
        expect((e as AuthError).statusCode).toBe(401);
      }
    });
  });

  // =========================================
  // logout
  // =========================================
  describe('로그아웃 (logout)', () => {
    it('저장된 리프레시 토큰이 있으면 삭제하고 성공을 반환한다', async () => {
      const storedToken = {
        id: 'token-id-1',
        userId: 'user-id-1',
        refreshToken: 'stored-refresh-token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      mockPrisma.authToken.findUnique.mockResolvedValue(storedToken);
      mockPrisma.authToken.delete.mockResolvedValue({} as never);

      const result = await logout('stored-refresh-token');

      expect(result.success).toBe(true);
      expect(mockPrisma.authToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-id-1' },
      });
    });

    it('저장되지 않은 리프레시 토큰이어도 성공을 반환한다', async () => {
      mockPrisma.authToken.findUnique.mockResolvedValue(null);

      const result = await logout('non-existing-token');

      expect(result.success).toBe(true);
      expect(mockPrisma.authToken.delete).not.toHaveBeenCalled();
    });
  });

  // =========================================
  // getMe
  // =========================================
  describe('내 정보 조회 (getMe)', () => {
    it('성공적으로 사용자 정보를 반환한다', async () => {
      const user = createTestUser({
        id: 'user-id-1',
        email: 'me@beesvat.com',
        nickname: '나',
        role: 'user',
        profileImage: 'https://example.com/avatar.png',
        createdAt: new Date('2026-01-15T09:00:00Z'),
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await getMe('user-id-1');

      expect(result.id).toBe('user-id-1');
      expect(result.email).toBe('me@beesvat.com');
      expect(result.nickname).toBe('나');
      expect(result.role).toBe('user');
      expect(result.profileImage).toBe('https://example.com/avatar.png');
      expect(result.createdAt).toBe('2026-01-15T09:00:00.000Z');
    });

    it('존재하지 않는 사용자 ID로 조회 시 404 에러를 던진다', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getMe('non-existing-id')).rejects.toThrow(AuthError);

      try {
        await getMe('non-existing-id');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('사용자를 찾을 수 없습니다');
        expect((e as AuthError).statusCode).toBe(404);
      }
    });
  });
});
