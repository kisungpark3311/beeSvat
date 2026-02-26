import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// FEAT-0: MSW server for API mocking in tests
export const server = setupServer(...handlers);
