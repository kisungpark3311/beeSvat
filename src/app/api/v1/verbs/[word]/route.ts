import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/server/middleware/auth.middleware';
import { getVerbDetail } from '@/server/services/verb.service';
import { verbDetailRequestSchema } from '@/server/schemas/verb.schema';

// FEAT-2: Get verb detail endpoint
export async function GET(request: NextRequest, { params }: { params: Promise<{ word: string }> }) {
  try {
    await authenticateRequest(request);
    const { word: rawWord } = await params;
    const word = decodeURIComponent(rawWord);

    const searchParams = request.nextUrl.searchParams;
    const parsed = verbDetailRequestSchema.safeParse({
      word,
      analysisResultId: searchParams.get('analysisResultId'),
    });

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

    const result = await getVerbDetail(parsed.data.analysisResultId, parsed.data.word);
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
