import { describe, it, expect, beforeEach } from 'bun:test';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  const dummyEnv = {
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    NEON_API_KEY: 'dummy-neon-api-key',
    NEON_PROJECT_ID: 'dummy-project',
    NEON_ENDPOINT_ID: 'ep-dummy-endpoint',
    BETTER_AUTH_SECRET: '01234567890123456789012345678901',
    BETTER_AUTH_URL: 'http://localhost:3001',
    GOOGLE_CLIENT_ID: 'dummy-google-id',
    GOOGLE_CLIENT_SECRET: 'dummy-google-secret',
    APPLE_CLIENT_ID: 'dummy-apple-id',
    APPLE_CLIENT_SECRET: 'dummy-apple-secret',
    R2_ACCOUNT_ID: 'dummy-r2-account',
    R2_ACCESS_KEY_ID: 'dummy-r2-key',
    R2_SECRET_ACCESS_KEY: 'dummy-r2-secret',
    R2_BUCKET_NAME: 'dummy-r2-bucket',
    R2_PUBLIC_BASE_URL: 'http://localhost:9000',
  };

  beforeEach(() => {
    Object.assign(process.env, dummyEnv);
  });

  it('parses CORS_ORIGINS_NATIVE correctly into string array', () => {
    const prevEnv = process.env.CORS_ORIGINS_NATIVE;
    process.env.CORS_ORIGINS_NATIVE = 'salafidurus-dev://, exp://, salafidurus://';

    try {
      const config = new ConfigService();
      expect(config.CORS_ORIGINS_NATIVE).toEqual([
        'salafidurus-dev://',
        'exp://',
        'salafidurus://',
      ]);
    } finally {
      if (prevEnv !== undefined) {
        process.env.CORS_ORIGINS_NATIVE = prevEnv;
      } else {
        delete process.env.CORS_ORIGINS_NATIVE;
      }
    }
  });

  it('returns default fallback array when CORS_ORIGINS_NATIVE is empty or default', () => {
    const prevEnv = process.env.CORS_ORIGINS_NATIVE;
    delete process.env.CORS_ORIGINS_NATIVE;

    try {
      const config = new ConfigService();
      expect(Array.isArray(config.CORS_ORIGINS_NATIVE)).toBe(true);
      expect(config.CORS_ORIGINS_NATIVE).toContain('salafidurus-dev://');
      expect(config.CORS_ORIGINS_NATIVE).toContain('exp://');
    } finally {
      if (prevEnv !== undefined) {
        process.env.CORS_ORIGINS_NATIVE = prevEnv;
      } else {
        delete process.env.CORS_ORIGINS_NATIVE;
      }
    }
  });
});
