import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getMe } from '@/server/services/auth.service';
import { authenticateRequest, AuthError } from '@/server/middleware/auth.middleware';

// FEAT-0: Get current user endpoint
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    const result = await getMe(userId);
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
