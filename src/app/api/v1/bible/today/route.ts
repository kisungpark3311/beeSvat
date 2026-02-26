import { NextResponse } from 'next/server';
import { getTodayQT } from '@/server/services/bible.service';

// FEAT-4: Get today's QT endpoint (public - no auth required)
export async function GET() {
  const result = getTodayQT();
  return NextResponse.json(
    { data: result },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
      },
    },
  );
}
