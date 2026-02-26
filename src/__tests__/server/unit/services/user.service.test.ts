// IMPORTANT: Import prismaMock BEFORE user.service to activate the mock
import { getMockPrisma } from '@/__tests__/utils/prismaMock';
import type { MockPrismaClient } from '@/__tests__/utils/prismaMock';
import { createTestUser } from '@/__tests__/utils/testHelpers';
import { describe, it, expect, beforeEach } from 'vitest';

// FEAT-0: User service unit tests

import { getUserProfile, updateUserProfile } from '@/server/services/user.service';
import { AuthError } from '@/server/middleware/auth.middleware';

describe('UserService', () => {
  let mockPrisma: MockPrismaClient;

  beforeEach(() => {
    mockPrisma = getMockPrisma();
  });

  // =========================================
  // getUserProfile
  // =========================================
  describe('사용자 프로필 조회 (getUserProfile)', () => {
    it('성공적으로 사용자 프로필을 반환한다', async () => {
      const user = createTestUser({
        id: 'user-id-1',
        email: 'profile@beesvat.com',
        nickname: '프로필사용자',
        role: 'user',
        profileImage: 'https://example.com/avatar.png',
        createdAt: new Date('2026-01-15T09:00:00Z'),
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);

      const result = await getUserProfile('user-id-1');

      expect(result.id).toBe('user-id-1');
      expect(result.email).toBe('profile@beesvat.com');
      expect(result.nickname).toBe('프로필사용자');
      expect(result.role).toBe('user');
      expect(result.profileImage).toBe('https://example.com/avatar.png');
      expect(result.createdAt).toBe('2026-01-15T09:00:00.000Z');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
      });
    });

    it('존재하지 않는 사용자 ID로 조회 시 404 에러를 던진다', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getUserProfile('non-existing-id')).rejects.toThrow(AuthError);

      try {
        await getUserProfile('non-existing-id');
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('사용자를 찾을 수 없습니다');
        expect((e as AuthError).statusCode).toBe(404);
      }
    });
  });

  // =========================================
  // updateUserProfile
  // =========================================
  describe('사용자 프로필 수정 (updateUserProfile)', () => {
    it('닉네임을 성공적으로 수정한다', async () => {
      const user = createTestUser({
        id: 'user-id-1',
        email: 'update@beesvat.com',
        nickname: '기존닉네임',
      });

      const updatedUser = createTestUser({
        id: 'user-id-1',
        email: 'update@beesvat.com',
        nickname: '새닉네임',
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await updateUserProfile('user-id-1', { nickname: '새닉네임' });

      expect(result.nickname).toBe('새닉네임');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { nickname: '새닉네임' },
      });
    });

    it('프로필 이미지를 성공적으로 수정한다', async () => {
      const user = createTestUser({
        id: 'user-id-1',
        profileImage: null,
      });

      const updatedUser = createTestUser({
        id: 'user-id-1',
        profileImage: 'https://example.com/new-avatar.png',
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await updateUserProfile('user-id-1', {
        profileImage: 'https://example.com/new-avatar.png',
      });

      expect(result.profileImage).toBe('https://example.com/new-avatar.png');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: { profileImage: 'https://example.com/new-avatar.png' },
      });
    });

    it('닉네임과 프로필 이미지를 동시에 수정한다', async () => {
      const user = createTestUser({
        id: 'user-id-1',
        nickname: '기존닉네임',
        profileImage: null,
      });

      const updatedUser = createTestUser({
        id: 'user-id-1',
        nickname: '새닉네임',
        profileImage: 'https://example.com/avatar.png',
        updatedAt: new Date('2026-02-01T00:00:00Z'),
      });

      mockPrisma.user.findUnique.mockResolvedValue(user);
      mockPrisma.user.update.mockResolvedValue(updatedUser);

      const result = await updateUserProfile('user-id-1', {
        nickname: '새닉네임',
        profileImage: 'https://example.com/avatar.png',
      });

      expect(result.nickname).toBe('새닉네임');
      expect(result.profileImage).toBe('https://example.com/avatar.png');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id-1' },
        data: {
          nickname: '새닉네임',
          profileImage: 'https://example.com/avatar.png',
        },
      });
    });

    it('존재하지 않는 사용자 ID로 수정 시 404 에러를 던진다', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(updateUserProfile('non-existing-id', { nickname: '새닉네임' })).rejects.toThrow(
        AuthError,
      );

      try {
        await updateUserProfile('non-existing-id', { nickname: '새닉네임' });
      } catch (e) {
        expect(e).toBeInstanceOf(AuthError);
        expect((e as AuthError).message).toBe('사용자를 찾을 수 없습니다');
        expect((e as AuthError).statusCode).toBe(404);
      }
    });
  });
});
