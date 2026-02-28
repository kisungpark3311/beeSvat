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
  try {
    const { payload } = await jwtVerify(token, jwtConfig.accessSecret, {
      algorithms: [jwtConfig.algorithm],
    });

    if (!payload.sub || payload.type !== 'access') {
      throw new AuthError('유효하지 않은 토큰입니다', 401);
    }

    return payload.sub;
  } catch (e) {
    if (e instanceof AuthError) throw e;
    throw new AuthError('인증 토큰이 만료되었거나 유효하지 않습니다', 401);
  }
}

// 비로그인 사용자도 허용 (게스트)
export async function optionalAuthenticateRequest(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    return await authenticateRequest(request);
  } catch {
    return null;
  }
}
