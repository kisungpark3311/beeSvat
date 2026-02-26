import type { HttpHandler } from 'msw';
import { authHandlers } from './auth';
import { analysisHandlers } from './analysis';
import { verbHandlers } from './verb';
import { meditationHandlers } from './meditation';
import { bibleHandlers } from './bible';

// FEAT-0: MSW mock handlers barrel export
export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...analysisHandlers,
  ...verbHandlers,
  ...meditationHandlers,
  ...bibleHandlers,
];
