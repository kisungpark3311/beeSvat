import { prisma } from '@/lib/prisma';
import { AuthError } from '@/server/middleware/auth.middleware';
import type { UpdateProfileRequest } from '@/server/schemas/user.schema';

// FEAT-0: User service

export async function getUserProfile(userId: string) {
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

export async function updateUserProfile(userId: string, data: UpdateProfileRequest) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError('사용자를 찾을 수 없습니다', 404);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return {
    id: updated.id,
    email: updated.email,
    nickname: updated.nickname,
    role: updated.role,
    profileImage: updated.profileImage,
    createdAt: updated.createdAt.toISOString(),
  };
}
