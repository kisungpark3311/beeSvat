import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { optionalAuthenticateRequest, AuthError } from '@/server/middleware/auth.middleware';
import { createMeditation, listMeditations } from '@/server/services/meditation.service';
import {
  createMeditationRequestSchema,
  meditationQuerySchema,
} from '@/server/schemas/meditation.schema';

// FEAT-3: Create meditation endpoint
export async function POST(request: NextRequest) {
  try {
    const userId = await optionalAuthenticateRequest(request);
    const body = await request.json();
    const parsed = createMeditationRequestSchema.safeParse(body);

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

    const result = await createMeditation(userId, parsed.data);
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

// FEAT-3: List meditations endpoint
export async function GET(request: NextRequest) {
  try {
    const userId = await optionalAuthenticateRequest(request);
    const searchParams = request.nextUrl.searchParams;
    const parsed = meditationQuerySchema.safeParse({
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

    const result = await listMeditations(userId, parsed.data);
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
