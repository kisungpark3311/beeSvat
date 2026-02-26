import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/server/services/user.service';
import { updateProfileSchema } from '@/server/schemas/user.schema';
import { authenticateRequest, AuthError } from '@/server/middleware/auth.middleware';

// FEAT-0: User profile endpoints

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    const result = await getUserProfile(userId);
    return NextResponse.json({ data: result });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: e.message } },
        { status: e.statusCode },
      );
    }
    throw e;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '입력값이 올바르지 않습니다',
            details: parsed.error.issues.map((i) => ({
              field: String(i.path[0]),
              message: i.message,
            })),
          },
        },
        { status: 400 },
      );
    }

    const result = await updateUserProfile(userId, parsed.data);
    return NextResponse.json({ data: result });
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'AUTH_ERROR', message: e.message } },
        { status: e.statusCode },
      );
    }
    throw e;
  }
}
