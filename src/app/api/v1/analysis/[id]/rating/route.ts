import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/server/middleware/auth.middleware';
import { rateAnalysis } from '@/server/services/analysis.service';
import { ratingRequestSchema } from '@/server/schemas/analysis.schema';

// FEAT-1: Rate analysis endpoint
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await authenticateRequest(request);
    const { id } = await params;
    const body = await request.json();
    const parsed = ratingRequestSchema.safeParse(body);

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

    const result = await rateAnalysis(userId, id, parsed.data.rating);
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
