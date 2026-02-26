import { beforeEach, vi } from 'vitest';

// FEAT-0: Prisma Client mock for unit testing

// Store reference to mock client at module level for direct access
let _mockClient: ReturnType<typeof mockPrismaClient>;

vi.mock('@/lib/prisma', () => ({
  prisma: getMockPrismaInternal(),
}));

function getMockPrismaInternal() {
  if (!_mockClient) {
    _mockClient = mockPrismaClient();
  }
  return _mockClient;
}

function mockPrismaClient() {
  const client = {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    authToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    analysis: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    analysisResult: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    verbAnalysis: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    meditation: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((fn: (tx: unknown) => Promise<unknown>) => fn(client)),
    $disconnect: vi.fn(),
  };
  return client;
}

export type MockPrismaClient = ReturnType<typeof mockPrismaClient>;

export function getMockPrisma(): MockPrismaClient {
  return getMockPrismaInternal();
}

beforeEach(() => {
  vi.clearAllMocks();
});
