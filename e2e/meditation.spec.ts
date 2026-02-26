import { test, expect, type Page } from '@playwright/test';

/**
 * Helper: inject authenticated state into localStorage before navigating.
 * Uses zustand persist storage key 'auth-storage'.
 */
async function injectAuth(page: Page): Promise<void> {
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
}

test.describe('Meditation list page', () => {
  test('should show login required when not authenticated', async ({ page }) => {
    await page.goto('/meditation');
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
  });

  test('should display meditation heading and new button when authenticated', async ({ page }) => {
    await page.route('**/api/v1/meditations?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        }),
      });
    });
    await page.route('**/api/v1/meditations', async (route) => {
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

    await injectAuth(page);
    await page.goto('/meditation');

    await expect(page.getByRole('heading', { name: '묵상 노트' })).toBeVisible();
    await expect(page.getByRole('link', { name: '새 묵상 작성' })).toBeVisible();
  });

  test('should display empty state when no meditations exist', async ({ page }) => {
    await page.route('**/api/v1/meditations**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        }),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation');

    await expect(page.getByText('묵상 노트가 없습니다')).toBeVisible();
  });

  test('should navigate to new meditation page when clicking new button', async ({ page }) => {
    await page.route('**/api/v1/meditations**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        }),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation');

    await page.getByRole('link', { name: '새 묵상 작성' }).click();
    await page.waitForURL('**/meditation/new');
    expect(page.url()).toContain('/meditation/new');
  });
});

test.describe('New meditation page', () => {
  test('should show login required when not authenticated', async ({ page }) => {
    await page.goto('/meditation/new');
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
  });

  test('should display new meditation heading and editor when authenticated', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/meditation/new');

    await expect(page.getByRole('heading', { name: '새 묵상 작성' })).toBeVisible();

    // MeditationEditor should show the textarea and buttons
    await expect(page.getByLabel('묵상 내용')).toBeVisible();
    await expect(page.getByRole('button', { name: '저장' })).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
  });

  test('should have save button disabled when content is empty', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/meditation/new');

    // Save button should be disabled when textarea is empty
    await expect(page.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  test('should enable save button when content is entered', async ({ page }) => {
    await injectAuth(page);
    await page.goto('/meditation/new');

    await page
      .getByLabel('묵상 내용')
      .fill('오늘 말씀을 묵상하며 하나님의 사랑을 깊이 느꼈습니다.');

    await expect(page.getByRole('button', { name: '저장' })).toBeEnabled();
  });

  test('should save meditation and redirect to detail page', async ({ page }) => {
    const mockMeditationId = 'meditation-123';

    await page.route('**/api/v1/meditations', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: mockMeditationId,
            content: '오늘 묵상 내용입니다.',
            status: 'draft',
            isAutoGenerated: false,
            analysisId: null,
            createdAt: '2026-02-26T00:00:00.000Z',
            updatedAt: '2026-02-26T00:00:00.000Z',
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock the detail page API for after redirect
    await page.route(`**/api/v1/meditations/${mockMeditationId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockMeditationId,
          content: '오늘 묵상 내용입니다.',
          status: 'draft',
          isAutoGenerated: false,
          analysisId: null,
          createdAt: '2026-02-26T00:00:00.000Z',
          updatedAt: '2026-02-26T00:00:00.000Z',
        }),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation/new');

    await page.getByLabel('묵상 내용').fill('오늘 묵상 내용입니다.');
    await page.getByRole('button', { name: '저장' }).click();

    await page.waitForURL(`**/meditation/${mockMeditationId}`);
    expect(page.url()).toContain(`/meditation/${mockMeditationId}`);
  });

  test('should go back when cancel is clicked', async ({ page }) => {
    await injectAuth(page);

    // Navigate through meditation list first to have browser history
    await page.route('**/api/v1/meditations**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        }),
      });
    });

    await page.goto('/meditation');
    await page.getByRole('link', { name: '새 묵상 작성' }).click();
    await page.waitForURL('**/meditation/new');

    await page.getByRole('button', { name: '취소' }).click();

    // Should navigate back to meditation list
    await page.waitForURL('**/meditation');
  });
});

test.describe('Meditation detail page', () => {
  test('should show login required when not authenticated', async ({ page }) => {
    await page.goto('/meditation/test-id');
    await expect(page.getByText('로그인이 필요합니다')).toBeVisible();
  });

  test('should display meditation content when authenticated', async ({ page }) => {
    const mockMeditation = {
      id: 'meditation-1',
      content: '하나님의 사랑에 감사하며, 오늘 하루를 보냅니다.',
      status: 'draft',
      isAutoGenerated: false,
      analysisId: null,
      createdAt: '2026-02-26T00:00:00.000Z',
      updatedAt: '2026-02-26T00:00:00.000Z',
    };

    await page.route('**/api/v1/meditations/meditation-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeditation),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation/meditation-1');

    await expect(page.getByRole('heading', { name: '묵상 노트' })).toBeVisible();
    await expect(page.getByText('하나님의 사랑에 감사하며')).toBeVisible();
    await expect(page.getByText('초안')).toBeVisible();
    await expect(page.getByRole('button', { name: '수정' })).toBeVisible();
    await expect(page.getByRole('button', { name: '삭제' })).toBeVisible();
  });

  test('should show AI generated badge when meditation is auto-generated', async ({ page }) => {
    const mockMeditation = {
      id: 'meditation-ai',
      content: 'AI가 생성한 묵상 내용입니다.',
      status: 'published',
      isAutoGenerated: true,
      analysisId: 'analysis-1',
      createdAt: '2026-02-26T00:00:00.000Z',
      updatedAt: '2026-02-26T00:00:00.000Z',
    };

    await page.route('**/api/v1/meditations/meditation-ai', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeditation),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation/meditation-ai');

    await expect(page.getByText('AI 생성')).toBeVisible();
    await expect(page.getByText('게시됨')).toBeVisible();
  });

  test('should switch to edit mode when edit button is clicked', async ({ page }) => {
    const mockMeditation = {
      id: 'meditation-edit',
      content: '수정할 묵상 내용입니다.',
      status: 'draft',
      isAutoGenerated: false,
      analysisId: null,
      createdAt: '2026-02-26T00:00:00.000Z',
      updatedAt: '2026-02-26T00:00:00.000Z',
    };

    await page.route('**/api/v1/meditations/meditation-edit', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeditation),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation/meditation-edit');

    await page.getByRole('button', { name: '수정' }).click();

    // Should show edit mode with heading and editor
    await expect(page.getByRole('heading', { name: '묵상 수정' })).toBeVisible();
    await expect(page.getByLabel('묵상 내용')).toBeVisible();
    await expect(page.getByLabel('묵상 내용')).toHaveValue('수정할 묵상 내용입니다.');
  });

  test('should show delete confirmation when delete is clicked', async ({ page }) => {
    const mockMeditation = {
      id: 'meditation-del',
      content: '삭제할 묵상입니다.',
      status: 'draft',
      isAutoGenerated: false,
      analysisId: null,
      createdAt: '2026-02-26T00:00:00.000Z',
      updatedAt: '2026-02-26T00:00:00.000Z',
    };

    await page.route('**/api/v1/meditations/meditation-del', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMeditation),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation/meditation-del');

    await page.getByRole('button', { name: '삭제' }).click();

    // Should show delete confirmation
    await expect(page.getByText('이 묵상을 삭제하시겠습니까?')).toBeVisible();
    await expect(page.getByRole('button', { name: '삭제 확인' })).toBeVisible();
    await expect(page.getByRole('button', { name: '취소' })).toBeVisible();
  });

  test('should delete meditation and redirect to list', async ({ page }) => {
    const mockMeditation = {
      id: 'meditation-del2',
      content: '삭제될 묵상입니다.',
      status: 'draft',
      isAutoGenerated: false,
      analysisId: null,
      createdAt: '2026-02-26T00:00:00.000Z',
      updatedAt: '2026-02-26T00:00:00.000Z',
    };

    await page.route('**/api/v1/meditations/meditation-del2', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockMeditation),
        });
      }
    });

    // Mock meditation list for redirect
    await page.route('**/api/v1/meditations?**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
        }),
      });
    });

    await injectAuth(page);
    await page.goto('/meditation/meditation-del2');

    // Click delete then confirm
    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByRole('button', { name: '삭제 확인' }).click();

    await page.waitForURL('**/meditation');
    expect(page.url()).toMatch(/\/meditation$/);
  });
});
