import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { jwtConfig } from '@/server/config/jwt.config';
import { AuthError } from '@/server/middleware/auth.middleware';
import type { RegisterRequest, LoginRequest } from '@contracts/auth.contract';

// FEAT-0: Authentication service

export async function register(data: RegisterRequest) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AuthError('이미 사용 중인 이메일입니다', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      nickname: data.nickname,
    },
  });

  const { accessToken, refreshToken } = await generateTokenPair(user.id);
  await saveRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, nickname: user.nickname, role: user.role },
    accessToken,
    refreshToken,
  };
}

export async function login(data: LoginRequest) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.passwordHash) {
    throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', 401);
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    throw new AuthError('이메일 또는 비밀번호가 올바르지 않습니다', 401);
  }

  const { accessToken, refreshToken } = await generateTokenPair(user.id);
  await saveRefreshToken(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      profileImage: user.profileImage,
    },
    accessToken,
    refreshToken,
  };
}

export async function refresh(refreshTokenValue: string) {
  const { payload } = await jwtVerify(refreshTokenValue, jwtConfig.refreshSecret, {
    algorithms: [jwtConfig.algorithm],
  }).catch(() => {
    throw new AuthError('유효하지 않은 리프레시 토큰입니다', 401);
  });

  if (!payload.sub || payload.type !== 'refresh') {
    throw new AuthError('유효하지 않은 리프레시 토큰입니다', 401);
  }

  const stored = await prisma.authToken.findUnique({
    where: { refreshToken: refreshTokenValue },
  });
  if (!stored) {
    throw new AuthError('유효하지 않은 리프레시 토큰입니다', 401);
  }

  await prisma.authToken.delete({ where: { id: stored.id } });

  const { accessToken, refreshToken: newRefreshToken } = await generateTokenPair(payload.sub);
  await saveRefreshToken(payload.sub, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenValue: string) {
  const stored = await prisma.authToken.findUnique({
    where: { refreshToken: refreshTokenValue },
  });
  if (stored) {
    await prisma.authToken.delete({ where: { id: stored.id } });
  }
  return { success: true };
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError('사용자를 찾을 수 없습니다', 404);
  }

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    profileImage: user.profileImage,
    createdAt: user.createdAt.toISOString(),
  };
}

// === Private Helpers ===

async function generateTokenPair(userId: string) {
  const accessToken = await new SignJWT({ sub: userId, type: 'access' })
    .setProtectedHeader({ alg: jwtConfig.algorithm })
    .setIssuedAt()
    .setExpirationTime(jwtConfig.accessExpiresIn)
    .sign(jwtConfig.accessSecret);

  const refreshToken = await new SignJWT({ sub: userId, type: 'refresh' })
    .setProtectedHeader({ alg: jwtConfig.algorithm })
    .setIssuedAt()
    .setExpirationTime(jwtConfig.refreshExpiresIn)
    .sign(jwtConfig.refreshSecret);

  return { accessToken, refreshToken };
}

async function saveRefreshToken(userId: string, token: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.authToken.create({
    data: {
      userId,
      refreshToken: token,
      expiresAt,
    },
  });
}
