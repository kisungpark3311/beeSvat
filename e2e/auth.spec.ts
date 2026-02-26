import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should display beeSvat heading', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'beeSvat' })).toBeVisible();
  });
});

test.describe('Register page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
  });

  test('should display register form with all fields', async ({ page }) => {
    await expect(page.getByLabel('이메일')).toBeVisible();
    await expect(page.getByLabel('닉네임')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.getByRole('button', { name: '회원가입' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: '회원가입' }).click();

    // Zod validation errors should appear for required fields
    // The register schema requires email (valid format), nickname (min 2), password (min 8)
    await expect(page.locator('.text-error').first()).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('이메일').fill('not-an-email');
    await page.getByLabel('닉네임').fill('testuser');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('올바른 이메일 형식이 아닙니다')).toBeVisible();
  });

  test('should show validation error for short nickname', async ({ page }) => {
    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('닉네임').fill('a');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('닉네임은 2자 이상이어야 합니다')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('닉네임').fill('testuser');
    await page.getByLabel('비밀번호').fill('short');
    await page.getByRole('button', { name: '회원가입' }).click();

    await expect(page.getByText('비밀번호는 8자 이상이어야 합니다')).toBeVisible();
  });

  test('should submit form and redirect to onboarding on success', async ({ page }) => {
    // Mock the register API to return success
    await page.route('**/api/v1/auth/register', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'newuser@example.com',
            nickname: 'newuser',
            role: 'user',
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });

    await page.getByLabel('이메일').fill('newuser@example.com');
    await page.getByLabel('닉네임').fill('newuser');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '회원가입' }).click();

    await page.waitForURL('**/onboarding');
    expect(page.url()).toContain('/onboarding');
  });

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: '로그인' });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  });

  test('should display login form with all fields', async ({ page }) => {
    await expect(page.getByLabel('이메일')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: '로그인' }).click();

    // Zod validation should trigger for empty email and password
    await expect(page.locator('.text-error').first()).toBeVisible();
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.getByLabel('이메일').fill('invalid-email');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    // Zod email validation error
    await expect(page.locator('.text-error').first()).toBeVisible();
  });

  test('should submit form and redirect to home on success', async ({ page }) => {
    // Mock the login API to return success
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            nickname: 'testuser',
            role: 'user',
            profileImage: null,
          },
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }),
      });
    });

    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();

    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });

  test('should show server error on login failure', async ({ page }) => {
    // Mock the login API to return failure
    await page.route('**/api/v1/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' },
        }),
      });
    });

    await page.getByLabel('이메일').fill('test@example.com');
    await page.getByLabel('비밀번호').fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다')).toBeVisible();
  });

  test('should have link to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: '회원가입' });
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await page.waitForURL('**/register');
    expect(page.url()).toContain('/register');
  });
});
