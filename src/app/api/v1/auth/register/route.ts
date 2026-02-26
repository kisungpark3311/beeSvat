import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { register } from '@/server/services/auth.service';
import { registerRequestSchema } from '@/server/schemas/auth.schema';
import { AuthError } from '@/server/middleware/auth.middleware';

// FEAT-0: User registration endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerRequestSchema.safeParse(body);

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

  try {
    const result = await register(parsed.data);
    return NextResponse.json({ data: result }, { status: 201 });
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
