import { describe, it, expect } from 'bun:test';
import { ConfigService } from './config.service';

describe('ConfigService', () => {
  const dummyEnv = {
    PRIMARY_DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    ANALYTICS_DATABASE_URL: 'postgresql://user:pass@localhost:5432/analytics',
    ANALYTICS_IDENTITY_HMAC_SECRET: '01234567890123456789012345678901',
    NEON_API_KEY: 'dummy-neon-api-key',
    NEON_PROJECT_ID: 'dummy-project',
    NEON_ENDPOINT_ID: 'ep-dummy-endpoint',
    BETTER_AUTH_SECRET: '01234567890123456789012345678901',
    BETTER_AUTH_URL: 'http://localhost:3001',
    GOOGLE_CLIENT_ID: 'dummy-google-id',
    GOOGLE_CLIENT_SECRET: 'dummy-google-secret',
    APPLE_CLIENT_ID: 'dummy-apple-id',
    APPLE_CLIENT_SECRET: 'dummy-apple-secret',
    R2_MEDIA_ACCOUNT_ID: 'dummy-r2-media-account',
    R2_MEDIA_ACCESS_KEY_ID: 'dummy-r2-media-key',
    R2_MEDIA_SECRET_ACCESS_KEY: 'dummy-r2-media-secret',
    R2_MEDIA_BUCKET_NAME: 'dummy-r2-media-bucket',
    R2_ANALYTICS_ACCOUNT_ID: 'dummy-r2-analytics-account',
    R2_ANALYTICS_ACCESS_KEY_ID: 'dummy-r2-analytics-key',
    R2_ANALYTICS_SECRET_ACCESS_KEY: 'dummy-r2-analytics-secret',
    R2_ANALYTICS_BUCKET_NAME: 'dummy-r2-analytics-bucket',
    R2_MEDIA_PUBLIC_BASE_URL: 'http://localhost:9000',
  };

  it('parses CORS_ORIGINS_NATIVE correctly into string array', () => {
    const config = new ConfigService({
      ...dummyEnv,
      CORS_ORIGINS_NATIVE: 'salafidurus-dev://, exp://, salafidurus://',
    });

    expect(config.CORS_ORIGINS_NATIVE).toEqual(['salafidurus-dev://', 'exp://', 'salafidurus://']);
  });

  it('exposes the primary database URL by role', () => {
    const config = new ConfigService(dummyEnv);
    expect(config.PRIMARY_DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/db');
  });

  it('exposes analytics connection and identity configuration by role', () => {
    const config = new ConfigService(dummyEnv);
    expect(config.ANALYTICS_DATABASE_URL).toBe('postgresql://user:pass@localhost:5432/analytics');
    expect(config.ANALYTICS_IDENTITY_HMAC_SECRET).toHaveLength(32);
  });

  it('returns default fallback array when CORS_ORIGINS_NATIVE is empty or default', () => {
    const config = new ConfigService(dummyEnv);

    expect(Array.isArray(config.CORS_ORIGINS_NATIVE)).toBe(true);
    expect(config.CORS_ORIGINS_NATIVE).toContain('salafidurus-dev://');
    expect(config.CORS_ORIGINS_NATIVE).toContain('exp://');
  });
});
