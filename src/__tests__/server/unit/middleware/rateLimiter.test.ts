import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkRateLimit,
  clearStore,
  cleanupStaleEntries,
  cleanupTimer,
} from '@/server/middleware/rateLimiter';
import type { RateLimitConfig } from '@/server/middleware/rateLimiter';

// FEAT-0: Rate limiter unit tests

// Clear the cleanup interval to prevent timer leaks in tests
afterEach(() => {
  clearInterval(cleanupTimer);
});

describe('checkRateLimit', () => {
  const testConfig: RateLimitConfig = { windowMs: 60_000, maxRequests: 3 };

  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('허용 범위 내에서 요청을 허용한다', () => {
    const result = checkRateLimit('test-key', testConfig);

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('제한 초과 시 요청을 거부한다', () => {
    // Exhaust all allowed requests
    checkRateLimit('test-key', testConfig);
    checkRateLimit('test-key', testConfig);
    checkRateLimit('test-key', testConfig);

    // This should be denied
    const result = checkRateLimit('test-key', testConfig);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('remaining 카운트가 올바르게 감소한다', () => {
    const first = checkRateLimit('test-key', testConfig);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit('test-key', testConfig);
    expect(second.remaining).toBe(1);

    const third = checkRateLimit('test-key', testConfig);
    expect(third.remaining).toBe(0);
  });

  it('시간 윈도우가 리셋되면 다시 허용된다', () => {
    // Exhaust all requests
    checkRateLimit('test-key', testConfig);
    checkRateLimit('test-key', testConfig);
    checkRateLimit('test-key', testConfig);

    const denied = checkRateLimit('test-key', testConfig);
    expect(denied.allowed).toBe(false);

    // Advance time past the window
    vi.advanceTimersByTime(60_001);

    const afterReset = checkRateLimit('test-key', testConfig);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(2);
  });

  it('다른 키는 독립적으로 추적된다', () => {
    // Exhaust key-a
    checkRateLimit('key-a', testConfig);
    checkRateLimit('key-a', testConfig);
    checkRateLimit('key-a', testConfig);

    const deniedA = checkRateLimit('key-a', testConfig);
    expect(deniedA.allowed).toBe(false);

    // key-b should still be allowed
    const allowedB = checkRateLimit('key-b', testConfig);
    expect(allowedB.allowed).toBe(true);
  });

  it('resetAt 값이 올바르게 반환된다', () => {
    const now = Date.now();
    const result = checkRateLimit('test-key', testConfig);

    expect(result.resetAt).toBe(now + testConfig.windowMs);
  });
});

describe('cleanupStaleEntries', () => {
  beforeEach(() => {
    clearStore();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('만료된 엔트리를 정리한다', () => {
    const config: RateLimitConfig = { windowMs: 1000, maxRequests: 5 };

    checkRateLimit('stale-key', config);

    // Advance past the window
    vi.advanceTimersByTime(1001);

    cleanupStaleEntries();

    // After cleanup, a new request should get full remaining count
    const result = checkRateLimit('stale-key', config);
    expect(result.remaining).toBe(4);
  });
});
