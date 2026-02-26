import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPassage } from '@/server/services/bible.service';
import { bibleVerseRequestSchema } from '@/server/schemas/bible.schema';
import { AuthError } from '@/server/middleware/auth.middleware';

// FEAT-4: Get Bible passage endpoint (public - no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ book: string; chapter: string }> },
) {
  const { book, chapter } = await params;
  const searchParams = request.nextUrl.searchParams;

  const parsed = bibleVerseRequestSchema.safeParse({
    book: decodeURIComponent(book),
    chapter,
    verseStart: searchParams.get('verseStart'),
    verseEnd: searchParams.get('verseEnd') ?? undefined,
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
    const result = getPassage(
      parsed.data.book,
      parsed.data.chapter,
      parsed.data.verseStart,
      parsed.data.verseEnd,
    );
    return NextResponse.json(
      { data: result },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
