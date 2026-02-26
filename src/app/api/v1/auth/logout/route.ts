import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logout } from '@/server/services/auth.service';
import { logoutRequestSchema } from '@/server/schemas/auth.schema';

// FEAT-0: Logout endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = logoutRequestSchema.safeParse(body);

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

  const result = await logout(parsed.data.refreshToken);
  return NextResponse.json({ data: result });
}
