import { test, expect } from '@playwright/test';

test.describe('Health check API', () => {
  test('GET /api/v1/health should return status ok', async ({ request }) => {
    const response = await request.get('/api/v1/health');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toEqual({
      status: 'ok',
      name: 'beeSvat',
    });
  });

  test('GET /api/v1/health should return JSON content type', async ({ request }) => {
    const response = await request.get('/api/v1/health');

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
});
