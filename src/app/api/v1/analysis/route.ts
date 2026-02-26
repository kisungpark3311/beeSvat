import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateRequest, AuthError } from '@/server/middleware/auth.middleware';
import { createAnalysis, listAnalyses, processAnalysis } from '@/server/services/analysis.service';
import { createAnalysisRequestSchema, analysisQuerySchema } from '@/server/schemas/analysis.schema';

// FEAT-1: Create analysis endpoint
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    const body = await request.json();
    const parsed = createAnalysisRequestSchema.safeParse(body);

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

    const result = await createAnalysis(userId, parsed.data);
    // Start AI processing in background (fire-and-forget)
    processAnalysis(result.id).catch(console.error);
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

// FEAT-1: List analyses endpoint
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const parsed = analysisQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
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

    const result = await listAnalyses(userId, parsed.data);
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
