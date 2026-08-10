import { beforeEach } from 'bun:test';

process.env.NEON_API_KEY ??= 'test-neon-api-key';
process.env.NEON_PROJECT_ID ??= 'test-project';
process.env.NEON_ENDPOINT_ID ??= 'ep-test-endpoint';

// Type alias for Vitest compatibility
export type Mocked<T> = T & {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K] & {
        mock: any;
        mockClear: () => void;
        mockReset: () => void;
        mockResolvedValue: (value: any) => Mocked<T>[K];
        mockReturnValue: (value: any) => Mocked<T>[K];
      }
    : T[K];
};

// Clear all mocks before each test
beforeEach(() => {
  // Bun's vi object provides clearAllMocks() for Vitest compatibility
});
