import { describe, expect, it } from 'bun:test';
import { getApiEnv } from './env';

const baseDevEnv = {
  NODE_ENV: 'development',
  PRIMARY_DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  ANALYTICS_DATABASE_URL: 'postgresql://user:pass@localhost:5432/analytics',
  ANALYTICS_IDENTITY_HMAC_SECRET: '01234567890123456789012345678901',
  BETTER_AUTH_SECRET: '01234567890123456789012345678901',
  BETTER_AUTH_URL: 'http://localhost:4000',
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

describe('getApiEnv — Neon control-plane credentials', () => {
  it('requires the explicitly named primary database URL', () => {
    expect(getApiEnv({ ...baseDevEnv }).PRIMARY_DATABASE_URL).toContain('postgresql://');
    expect(() => getApiEnv({ ...baseDevEnv, PRIMARY_DATABASE_URL: undefined })).toThrow();
  });

  it('requires the dedicated analytics database and identity secret', () => {
    expect(getApiEnv({ ...baseDevEnv }).ANALYTICS_DATABASE_URL).toContain('postgresql://');
    expect(getApiEnv({ ...baseDevEnv }).ANALYTICS_IDENTITY_HMAC_SECRET).toHaveLength(32);
    expect(() => getApiEnv({ ...baseDevEnv, ANALYTICS_DATABASE_URL: undefined })).toThrow();
    expect(() => getApiEnv({ ...baseDevEnv, ANALYTICS_IDENTITY_HMAC_SECRET: undefined })).toThrow();
  });

  it('parses successfully in development without any NEON_* variables', () => {
    const env = getApiEnv({ ...baseDevEnv });

    expect(env.NEON_API_KEY).toBeUndefined();
    expect(env.NEON_PROJECT_ID).toBeUndefined();
    expect(env.NEON_ENDPOINT_ID).toBeUndefined();
  });

  it('rejects a partial NEON_* set regardless of environment', () => {
    const partial = {
      ...baseDevEnv,
      NEON_API_KEY: 'key-only',
    };

    expect(() => getApiEnv(partial)).toThrow(/provided together/);
  });

  it('rejects missing NEON_* variables outside development', () => {
    const prod = { ...baseDevEnv, NODE_ENV: 'production' };

    expect(() => getApiEnv(prod)).toThrow(/required unless NODE_ENV=development/);
  });

  it('accepts a complete NEON_* set', () => {
    const complete = {
      ...baseDevEnv,
      NEON_API_KEY: 'neon-key',
      NEON_PROJECT_ID: 'neon-project',
      NEON_ENDPOINT_ID: 'ep-neon-endpoint',
    };

    expect(getApiEnv(complete).NEON_ENDPOINT_ID).toBe('ep-neon-endpoint');
  });

  it('defaults proxy trust to zero hops', () => {
    expect(getApiEnv(baseDevEnv).TRUST_PROXY_HOPS).toBe(0);
  });

  it('bounds proxy trust to the configured hop range', () => {
    expect(getApiEnv({ ...baseDevEnv, TRUST_PROXY_HOPS: '2' }).TRUST_PROXY_HOPS).toBe(2);
    expect(() => getApiEnv({ ...baseDevEnv, TRUST_PROXY_HOPS: '11' })).toThrow();
  });
});

describe('getApiEnv — operational telemetry', () => {
  it('keeps telemetry disabled unless an endpoint and headers are configured', () => {
    expect(getApiEnv(baseDevEnv).OTEL_EXPORTER_OTLP_ENDPOINT).toBeUndefined();
    expect(getApiEnv(baseDevEnv).OTEL_EXPORTER_OTLP_HEADERS).toBeUndefined();

    const configured = getApiEnv({
      ...baseDevEnv,
      OTEL_EXPORTER_OTLP_ENDPOINT: 'https://otlp.nr-data.net',
      OTEL_EXPORTER_OTLP_HEADERS: 'api-key=secret',
    });

    expect(configured.OTEL_EXPORTER_OTLP_ENDPOINT).toBe('https://otlp.nr-data.net');
    expect(configured.OTEL_EXPORTER_OTLP_HEADERS).toBe('api-key=secret');
  });

  it('normalizes empty optional exporter values and applies API resource defaults', () => {
    const env = getApiEnv({
      ...baseDevEnv,
      OTEL_EXPORTER_OTLP_ENDPOINT: '',
      OTEL_EXPORTER_OTLP_HEADERS: '',
    });

    expect(env.OTEL_EXPORTER_OTLP_ENDPOINT).toBeUndefined();
    expect(env.OTEL_EXPORTER_OTLP_HEADERS).toBeUndefined();
    expect(env.OTEL_SERVICE_NAME).toBe('salafi-durus-api');
    expect(env.OTEL_PLATFORM).toBe('api');
    expect(env.OTEL_REGION).toBe('unknown');
    expect(env.OTEL_DEPLOYMENT_VERSION).toBe('unknown');
  });

  it('allows deployment metadata to be explicitly supplied', () => {
    const env = getApiEnv({
      ...baseDevEnv,
      NODE_ENV: 'production',
      NEON_API_KEY: 'neon-key',
      NEON_PROJECT_ID: 'neon-project',
      NEON_ENDPOINT_ID: 'ep-neon-endpoint',
      OTEL_DEPLOYMENT_VERSION: 'release-123',
      OTEL_REGION: 'eu-west-1',
    });

    expect(env.OTEL_DEPLOYMENT_VERSION).toBe('release-123');
    expect(env.OTEL_REGION).toBe('eu-west-1');
  });
});
