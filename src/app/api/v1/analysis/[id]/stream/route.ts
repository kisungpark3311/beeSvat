import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { jwtConfig } from '@/server/config/jwt.config';
import { prisma } from '@/lib/prisma';
import { analyzePassage } from '@/server/services/ai.service';

// T2.4: SSE streaming endpoint for real-time analysis progress

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Auth via query param (SSE doesn't support custom headers)
  const token = request.nextUrl.searchParams.get('token');
  if (!token) {
    return new Response(
      JSON.stringify({ error: { code: 'AUTH_ERROR', message: '인증 토큰이 필요합니다' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let userId: string;
  try {
    const { payload } = await jwtVerify(token, jwtConfig.accessSecret, {
      algorithms: [jwtConfig.algorithm],
    });
    if (!payload.sub || payload.type !== 'access') {
      return new Response(
        JSON.stringify({ error: { code: 'AUTH_ERROR', message: '유효하지 않은 토큰입니다' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } },
      );
    }
    userId = payload.sub;
  } catch {
    return new Response(
      JSON.stringify({ error: { code: 'AUTH_ERROR', message: '유효하지 않은 토큰입니다' } }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Get the analysis
  const analysis = await prisma.analysis.findUnique({ where: { id } });
  if (!analysis) {
    return new Response(
      JSON.stringify({ error: { code: 'NOT_FOUND', message: '분석을 찾을 수 없습니다' } }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (analysis.userId !== userId) {
    return new Response(
      JSON.stringify({ error: { code: 'FORBIDDEN', message: '접근 권한이 없습니다' } }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const sseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };

  // If already completed, return the result immediately
  if (analysis.status === 'completed') {
    const completed = await prisma.analysis.findUnique({
      where: { id },
      include: { result: true },
    });

    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(`event: result\ndata: ${JSON.stringify(completed)}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, { headers: sseHeaders });
  }

  // Start SSE stream for processing
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      }

      try {
        send('status', { message: '구문 분석을 시작합니다...' });

        send('status', { message: 'AI가 성경 본문을 분석하고 있습니다...' });

        const aiResult = await analyzePassage(
          analysis.passageText,
          analysis.book,
          analysis.chapter,
          analysis.verseStart,
          analysis.verseEnd,
        );

        send('status', { message: '분석 결과를 저장하고 있습니다...' });

        await prisma.analysisResult.create({
          data: {
            analysisId: id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            structure: aiResult.structure as any,
            explanation: aiResult.explanation,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mainVerbs: aiResult.mainVerbs as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            modifiers: aiResult.modifiers as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            connectors: aiResult.connectors as any,
            aiModel: aiResult.aiModel,
            processingTimeMs: aiResult.processingTimeMs,
          },
        });

        await prisma.analysis.update({
          where: { id },
          data: { status: 'completed' },
        });

        const completed = await prisma.analysis.findUnique({
          where: { id },
          include: { result: true },
        });

        send('result', completed);
      } catch (err) {
        await prisma.analysis
          .update({
            where: { id },
            data: { status: 'failed' },
          })
          .catch(() => {});

        send('error', {
          message: err instanceof Error ? err.message : '분석 중 오류가 발생했습니다',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: sseHeaders });
}
