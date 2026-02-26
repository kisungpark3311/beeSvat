import { test, expect } from '@playwright/test';

test.describe('Bible API - Today QT', () => {
  test('GET /api/v1/bible/today should return today QT data', async ({ request }) => {
    const response = await request.get('/api/v1/bible/today');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');

    // The data should contain QT information
    const data = body.data;
    expect(data).toBeDefined();
  });

  test('GET /api/v1/bible/today should return JSON content type', async ({ request }) => {
    const response = await request.get('/api/v1/bible/today');

    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
  });
});

test.describe('Bible API - Get passage', () => {
  test('GET /api/v1/bible/{book}/{chapter} should return passage with verseStart', async ({
    request,
  }) => {
    const response = await request.get(
      `/api/v1/bible/${encodeURIComponent('요한복음')}/3?verseStart=16`,
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
  });

  test('GET /api/v1/bible/{book}/{chapter} should return passage with verse range', async ({
    request,
  }) => {
    const response = await request.get(
      `/api/v1/bible/${encodeURIComponent('요한복음')}/3?verseStart=16&verseEnd=18`,
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
  });

  test('GET /api/v1/bible/{book}/{chapter} should return 400 for missing verseStart', async ({
    request,
  }) => {
    const response = await request.get(`/api/v1/bible/${encodeURIComponent('요한복음')}/3`);

    // Should return validation error since verseStart is required
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  test('GET /api/v1/bible/{book}/{chapter} should return 400 for invalid chapter', async ({
    request,
  }) => {
    const response = await request.get(
      `/api/v1/bible/${encodeURIComponent('요한복음')}/abc?verseStart=1`,
    );

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});

test.describe('Bible API - Search', () => {
  test('GET /api/v1/bible/search should return search results', async ({ request }) => {
    const response = await request.get(
      `/api/v1/bible/search?query=${encodeURIComponent('하나님')}`,
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
  });

  test('GET /api/v1/bible/search should support pagination', async ({ request }) => {
    const response = await request.get(
      `/api/v1/bible/search?query=${encodeURIComponent('사랑')}&page=1&limit=5`,
    );

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('data');
  });

  test('GET /api/v1/bible/search should return 400 for missing query', async ({ request }) => {
    const response = await request.get('/api/v1/bible/search');

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
    expect(body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  });

  test('GET /api/v1/bible/search should return 400 for empty query', async ({ request }) => {
    const response = await request.get('/api/v1/bible/search?query=');

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
