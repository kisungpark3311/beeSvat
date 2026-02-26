import { http, HttpResponse } from 'msw';
import { mockUser, mockTokens } from '@/mocks/data/auth';

// FEAT-0: Auth API mock handlers
export const authHandlers = [
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; nickname: string };
    return HttpResponse.json(
      {
        data: {
          user: { id: mockUser.id, email: body.email, nickname: body.nickname, role: 'user' },
          ...mockTokens,
        },
      },
      { status: 201 },
    );
  }),

  http.post('/api/v1/auth/login', async () => {
    return HttpResponse.json({
      data: { user: mockUser, ...mockTokens },
    });
  }),

  http.post('/api/v1/auth/refresh', async () => {
    return HttpResponse.json({
      data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
    });
  }),

  http.post('/api/v1/auth/logout', async () => {
    return HttpResponse.json({ data: { success: true } });
  }),

  http.get('/api/v1/auth/me', async () => {
    return HttpResponse.json({
      data: { ...mockUser, createdAt: '2026-01-01T00:00:00.000Z' },
    });
  }),
];
