import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { optionalAuthenticateRequest, AuthError } from '@/server/middleware/auth.middleware';
import { getAnalysis, deleteAnalysis, retryAnalysis } from '@/server/services/analysis.service';

// FEAT-1: Get analysis detail endpoint
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await optionalAuthenticateRequest(request);
    const { id } = await params;
    const result = await getAnalysis(userId, id);
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

// FEAT-2: Delete analysis endpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await optionalAuthenticateRequest(request);
    const { id } = await params;
    const result = await deleteAnalysis(userId, id);
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

// FEAT-2: Retry analysis endpoint (reset to pending)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await optionalAuthenticateRequest(request);
    const { id } = await params;
    const result = await retryAnalysis(userId, id);
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
