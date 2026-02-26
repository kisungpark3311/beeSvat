import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { jwtConfig } from '@/server/config/jwt.config';

// FEAT-0: JWT authentication middleware

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function authenticateRequest(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('인증 토큰이 필요합니다', 401);
  }

  const token = authHeader.slice(7);
  const { payload } = await jwtVerify(token, jwtConfig.accessSecret, {
    algorithms: [jwtConfig.algorithm],
  });

  if (!payload.sub || payload.type !== 'access') {
    throw new AuthError('유효하지 않은 토큰입니다', 401);
  }

  return payload.sub;
}
