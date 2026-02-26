import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/server/middleware/auth.middleware';
import { generateMeditation } from '@/server/services/meditation.service';
import { generateMeditationRequestSchema } from '@/server/schemas/meditation.schema';

// FEAT-3: Generate AI meditation endpoint
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    const body = await request.json();
    const parsed = generateMeditationRequestSchema.safeParse(body);

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

    const result = await generateMeditation(userId, parsed.data.analysisId);
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
