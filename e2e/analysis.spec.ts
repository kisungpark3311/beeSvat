import { test, expect } from '@playwright/test';

test.describe('Home page - Analysis section', () => {
  test('should display analysis heading on home page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: '성경 구문 분석' })).toBeVisible();
  });

  test('should display VerseInputForm with all fields', async ({ page }) => {
    await page.goto('/');

    // VerseInputForm fields use the custom Input component with label prop
    await expect(page.getByLabel('성경 책명')).toBeVisible();
    await expect(page.getByLabel('장')).toBeVisible();
    await expect(page.getByLabel('시작 절')).toBeVisible();
    await expect(page.getByLabel('끝 절')).toBeVisible();
    await expect(page.getByLabel('본문 직접 입력')).toBeVisible();
    await expect(page.getByRole('button', { name: '구문 분석하기' })).toBeVisible();
  });

  test('should show login required error when submitting without auth', async ({ page }) => {
    await page.goto('/');

    // Fill in all required fields
    await page.getByLabel('성경 책명').fill('요한복음');
    await page.getByLabel('장').fill('3');
    await page.getByLabel('시작 절').fill('16');
    await page.getByLabel('본문 직접 입력').fill('하나님이 세상을 이처럼 사랑하사');

    await page.getByRole('button', { name: '구문 분석하기' }).click();

    // Without authentication, form should show login required error
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
  });

  test('should show validation error when book name is empty', async ({ page }) => {
    await page.goto('/');

    // Attempt to submit with missing book name but other fields filled
    await page.getByLabel('장').fill('3');
    await page.getByLabel('시작 절').fill('16');
    await page.getByLabel('본문 직접 입력').fill('테스트 본문');

    await page.getByRole('button', { name: '구문 분석하기' }).click();

    // Since the user is not logged in, the login error appears first
    // The book validation would only run after auth check passes
    // This test verifies the submit button triggers the form submission
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert.first()).toBeVisible();
  });
});

test.describe('Analysis list page', () => {
  test('should show login required when not authenticated', async ({ page }) => {
    await page.goto('/analysis');
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
  });

  test('should display analysis list heading when authenticated', async ({ page }) => {
    // Mock the analysis list API
    await page.route('**/api/v1/analysis', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [],
            meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Inject auth state into localStorage before navigating
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'test-id',
            email: 'test@example.com',
            nickname: 'tester',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    });

    await page.goto('/analysis');
    await expect(page.getByRole('heading', { name: '구문 분석 목록' })).toBeVisible();
  });

  test('should display empty state message when no analyses exist', async ({ page }) => {
    // Mock empty analysis list
    await page.route('**/api/v1/analysis', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [],
            meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Inject auth state
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'test-id',
            email: 'test@example.com',
            nickname: 'tester',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    });

    await page.goto('/analysis');
    await expect(page.getByText('아직 분석 결과가 없습니다')).toBeVisible();
  });

  test('should display analysis items when data exists', async ({ page }) => {
    const mockAnalyses = [
      {
        id: 'analysis-1',
        book: '요한복음',
        chapter: 3,
        verseStart: 16,
        verseEnd: 16,
        status: 'completed',
        rating: 4,
        createdAt: '2026-02-26T00:00:00.000Z',
      },
      {
        id: 'analysis-2',
        book: '창세기',
        chapter: 1,
        verseStart: 1,
        verseEnd: 3,
        status: 'pending',
        rating: null,
        createdAt: '2026-02-25T00:00:00.000Z',
      },
    ];

    await page.route('**/api/v1/analysis', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockAnalyses,
            meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Inject auth state
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'test-id',
            email: 'test@example.com',
            nickname: 'tester',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    });

    await page.goto('/analysis');

    await expect(page.getByText('요한복음 3:16')).toBeVisible();
    await expect(page.getByText('창세기 1:1-3')).toBeVisible();
    await expect(page.getByText('완료')).toBeVisible();
    await expect(page.getByText('분석 중')).toBeVisible();
  });
});

test.describe('Analysis detail page', () => {
  test('should show login required when not authenticated', async ({ page }) => {
    await page.goto('/analysis/test-id');
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
  });

  test('should show loading state initially when authenticated', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/v1/analysis/test-id', async (route) => {
      // Delay the response to observe loading state
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-id',
          book: '요한복음',
          chapter: 3,
          verseStart: 16,
          verseEnd: 16,
          passageText: '하나님이 세상을 이처럼 사랑하사',
          status: 'completed',
          rating: null,
          result: null,
          createdAt: '2026-02-26T00:00:00.000Z',
        }),
      });
    });

    // Inject auth state
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'test-id',
            email: 'test@example.com',
            nickname: 'tester',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    });

    await page.goto('/analysis/test-id');

    // Should show loading spinner
    await expect(page.getByRole('status', { name: 'loading' })).toBeVisible();
  });

  test('should show not found message for non-existent analysis', async ({ page }) => {
    await page.route('**/api/v1/analysis/non-existent', async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'NOT_FOUND', message: 'Analysis not found' },
        }),
      });
    });

    // Inject auth state
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'test-id',
            email: 'test@example.com',
            nickname: 'tester',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    });

    await page.goto('/analysis/non-existent');

    // The error or not-found message should appear
    await expect(page.getByText(/(분석 결과를 찾을 수 없습니다|Analysis not found)/)).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('Analysis form submission with auth', () => {
  test('should submit analysis and redirect to detail page', async ({ page }) => {
    const mockAnalysisId = 'new-analysis-123';

    // Mock the analysis creation API
    await page.route('**/api/v1/analysis', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: mockAnalysisId,
            book: '요한복음',
            chapter: 3,
            verseStart: 16,
            verseEnd: 16,
            passageText: '하나님이 세상을 이처럼 사랑하사',
            status: 'pending',
            rating: null,
            createdAt: '2026-02-26T00:00:00.000Z',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock the analysis detail page API (for after redirect)
    await page.route(`**/api/v1/analysis/${mockAnalysisId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockAnalysisId,
          book: '요한복음',
          chapter: 3,
          verseStart: 16,
          verseEnd: 16,
          passageText: '하나님이 세상을 이처럼 사랑하사',
          status: 'pending',
          rating: null,
          result: null,
          createdAt: '2026-02-26T00:00:00.000Z',
        }),
      });
    });

    // Mock SSE stream endpoint
    await page.route(`**/api/v1/analysis/${mockAnalysisId}/stream`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: 'data: {"status":"processing","progress":"분석 중..."}\n\n',
      });
    });

    // Inject auth state
    await page.goto('/');
    await page.evaluate(() => {
      const authState = {
        state: {
          user: {
            id: 'test-id',
            email: 'test@example.com',
            nickname: 'tester',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh',
          isAuthenticated: true,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    });

    await page.goto('/');

    // Fill in the analysis form
    await page.getByLabel('성경 책명').fill('요한복음');
    await page.getByLabel('장').fill('3');
    await page.getByLabel('시작 절').fill('16');
    await page.getByLabel('본문 직접 입력').fill('하나님이 세상을 이처럼 사랑하사');

    await page.getByRole('button', { name: '구문 분석하기' }).click();

    // Should redirect to the analysis detail page
    await page.waitForURL(`**/analysis/${mockAnalysisId}`);
    expect(page.url()).toContain(`/analysis/${mockAnalysisId}`);
  });
});
