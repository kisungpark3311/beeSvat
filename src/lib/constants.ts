// App constants
export const APP_NAME = 'beeSvat';
export const APP_DESCRIPTION = '성경 구문 분석 도우미';

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// Rate limit
export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_ANALYSIS = 10;
export const RATE_LIMIT_MAX_MEDITATION = 20;

// Cache durations (seconds)
export const CACHE_BIBLE_PASSAGE = 3600; // 1 hour
export const CACHE_TODAY_QT = 86400; // 24 hours
