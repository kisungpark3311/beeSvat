import { http, HttpResponse } from 'msw';
import { mockAnalysis, mockAnalysisList } from '@/mocks/data/analysis';

// FEAT-2: Analysis API mock handlers
export const analysisHandlers = [
  // POST /api/v1/analysis - Create new analysis
  http.post('/api/v1/analysis', async () => {
    return HttpResponse.json(
      {
        data: {
          id: 'analysis-new',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  }),

  // GET /api/v1/analysis - List analyses with pagination
  http.get('/api/v1/analysis', async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '1');
    const limit = Number(url.searchParams.get('limit') ?? '10');

    return HttpResponse.json({
      data: mockAnalysisList,
      meta: {
        page,
        limit,
        total: mockAnalysisList.length,
        totalPages: Math.ceil(mockAnalysisList.length / limit),
      },
    });
  }),

  // GET /api/v1/analysis/:id - Get analysis detail
  http.get('/api/v1/analysis/:id', async () => {
    return HttpResponse.json({
      data: mockAnalysis,
    });
  }),

  // PATCH /api/v1/analysis/:id/rating - Rate analysis
  http.patch('/api/v1/analysis/:id/rating', async ({ request, params }) => {
    const body = (await request.json()) as { rating: number };
    return HttpResponse.json({
      data: {
        id: params.id as string,
        rating: body.rating,
      },
    });
  }),
];
