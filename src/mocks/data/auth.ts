import type { AuthUser } from '@contracts/auth.contract';

// FEAT-0: Auth mock data
export const mockUser: AuthUser = {
  id: 'mock-user-id-1',
  email: 'test@beesvat.com',
  nickname: '테스트 사용자',
  role: 'user',
  profileImage: null,
};

export const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};
