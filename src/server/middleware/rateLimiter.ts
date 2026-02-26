// FEAT-0: In-memory rate limiter
// For production, replace with Redis-based rate limiter

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export const RATE_LIMITS = {
  analysis: { windowMs: 60_000, maxRequests: 10 }, // 10 requests per minute for AI analysis
  auth: { windowMs: 60_000, maxRequests: 20 }, // 20 requests per minute for auth
  general: { windowMs: 60_000, maxRequests: 100 }, // 100 requests per minute general
} as const;

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Export for testing - clears the internal store
export function clearStore(): void {
  store.clear();
}

// Cleanup stale entries periodically (every 5 minutes)
// Wrapped in a check so tests can control timers
const CLEANUP_INTERVAL_MS = 5 * 60_000;

export function cleanupStaleEntries(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export const cleanupTimer = setInterval(cleanupStaleEntries, CLEANUP_INTERVAL_MS);
