import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { searchVerses } from '@/server/services/bible.service';
import { bibleSearchSchema } from '@/server/schemas/bible.schema';
import { AuthError } from '@/server/middleware/auth.middleware';

// FEAT-4: Search Bible verses endpoint (public - no auth required)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const parsed = bibleSearchSchema.safeParse({
    query: searchParams.get('query'),
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
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

  try {
    const result = searchVerses(parsed.data.query, parsed.data.page, parsed.data.limit);
    return NextResponse.json(
      { data: result },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        },
      },
    );
  } catch (e) {
    if (e instanceof AuthError) {
      return NextResponse.json(
        { error: { code: 'ERROR', message: e.message } },
        { status: e.statusCode },
      );
    }
    throw e;
  }
}
