import { Injectable, Optional } from '@nestjs/common';
import { getApiEnv } from './env';

/**
 * Provides validated API configuration to NestJS consumers.
 *
 * Production callers use the process environment by default. Tests and other
 * controlled bootstraps may provide an explicit environment so configuration
 * validation does not depend on dotenv files loaded by the runtime.
 */
@Injectable()
/** Core API config.service module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ConfigService {
  private readonly env: ReturnType<typeof getApiEnv>;

  constructor(@Optional() rawEnv: NodeJS.ProcessEnv = process.env) {
    this.env = getApiEnv(rawEnv);
  }

  get PORT() {
    return this.env.PORT;
  }

  get NODE_ENV() {
    return this.env.NODE_ENV;
  }

  get CORS_ORIGINS_RAW(): string {
    return this.env.CORS_ORIGIN;
  }

  get CORS_ORIGINS(): string[] {
    return this.env.CORS_ORIGIN.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  get CORS_ORIGINS_NATIVE(): string[] {
    if (!this.env.CORS_ORIGINS_NATIVE) return [];
    return this.env.CORS_ORIGINS_NATIVE.split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  get PRIMARY_DATABASE_URL(): string {
    return this.env.PRIMARY_DATABASE_URL;
  }

  get PRIMARY_DIRECT_DATABASE_URL(): string | undefined {
    return this.env.PRIMARY_DIRECT_DATABASE_URL;
  }

  get PRIMARY_SHADOW_DATABASE_URL(): string | undefined {
    return this.env.PRIMARY_SHADOW_DATABASE_URL;
  }

  get ANALYTICS_DATABASE_URL(): string {
    return this.env.ANALYTICS_DATABASE_URL;
  }

  get ANALYTICS_IDENTITY_HMAC_SECRET(): string {
    return this.env.ANALYTICS_IDENTITY_HMAC_SECRET;
  }

  /** Optional Mixpanel project token; absent configuration disables external publishing. */
  get MIXPANEL_PROJECT_TOKEN(): string | undefined {
    return this.env.MIXPANEL_PROJECT_TOKEN;
  }

  /** Mixpanel import host, configurable for regional or controlled test endpoints. */
  get MIXPANEL_API_URL(): string {
    return this.env.MIXPANEL_API_URL;
  }

  get NEON_API_KEY(): string | undefined {
    return this.env.NEON_API_KEY;
  }

  get NEON_PROJECT_ID(): string | undefined {
    return this.env.NEON_PROJECT_ID;
  }

  get NEON_ENDPOINT_ID(): string | undefined {
    return this.env.NEON_ENDPOINT_ID;
  }

  get PRISMA_LOG_QUERIES(): boolean {
    return this.env.PRISMA_LOG_QUERIES;
  }

  get ASSET_CDN_BASE_URL(): string | undefined {
    return this.env.ASSET_CDN_BASE_URL;
  }

  get SITEMAP_BASE_URL(): string | undefined {
    return this.env.SITEMAP_BASE_URL;
  }

  // better-auth
  get BETTER_AUTH_SECRET(): string {
    return this.env.BETTER_AUTH_SECRET;
  }

  get BETTER_AUTH_URL(): string {
    return this.env.BETTER_AUTH_URL;
  }

  get COOKIE_DOMAIN(): string {
    return this.env.COOKIE_DOMAIN;
  }

  get GOOGLE_CLIENT_ID(): string {
    return this.env.GOOGLE_CLIENT_ID;
  }

  get GOOGLE_CLIENT_SECRET(): string {
    return this.env.GOOGLE_CLIENT_SECRET;
  }

  get APPLE_CLIENT_ID(): string {
    return this.env.APPLE_CLIENT_ID;
  }

  get APPLE_CLIENT_SECRET(): string {
    return this.env.APPLE_CLIENT_SECRET;
  }

  get R2_ACCOUNT_ID(): string {
    return this.env.R2_ACCOUNT_ID;
  }
  get R2_ACCESS_KEY_ID(): string {
    return this.env.R2_ACCESS_KEY_ID;
  }
  get R2_SECRET_ACCESS_KEY(): string {
    return this.env.R2_SECRET_ACCESS_KEY;
  }
  get R2_BUCKET_NAME(): string {
    return this.env.R2_BUCKET_NAME;
  }
  get R2_PUBLIC_BASE_URL(): string {
    return this.env.R2_PUBLIC_BASE_URL;
  }
  get R2_PRESIGN_EXPIRES_SECONDS(): number {
    return this.env.R2_PRESIGN_EXPIRES_SECONDS;
  }

  get DISABLE_THROTTLER(): boolean {
    return this.env.DISABLE_THROTTLER;
  }

  get REDIS_URL(): string | undefined {
    return this.env.REDIS_URL;
  }

  /** Number of trusted reverse-proxy hops used when resolving anonymous IP identity. */
  get TRUST_PROXY_HOPS(): number {
    return this.env.TRUST_PROXY_HOPS;
  }

  get OTEL_SERVICE_NAME(): string {
    return this.env.OTEL_SERVICE_NAME;
  }

  get OTEL_EXPORTER_OTLP_ENDPOINT(): string | undefined {
    return this.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  }

  get OTEL_EXPORTER_OTLP_HEADERS(): string | undefined {
    return this.env.OTEL_EXPORTER_OTLP_HEADERS;
  }

  get OTEL_EXPORTER_OTLP_PROTOCOL(): 'http/protobuf' | 'grpc' {
    return this.env.OTEL_EXPORTER_OTLP_PROTOCOL;
  }

  get OTEL_EXPORTER_OTLP_COMPRESSION(): 'none' | 'gzip' {
    return this.env.OTEL_EXPORTER_OTLP_COMPRESSION;
  }

  get OTEL_ENVIRONMENT(): 'development' | 'preview' | 'production' | undefined {
    return this.env.OTEL_ENVIRONMENT;
  }

  get OTEL_REGION(): string {
    return this.env.OTEL_REGION;
  }

  get OTEL_DEPLOYMENT_VERSION(): string {
    return this.env.OTEL_DEPLOYMENT_VERSION;
  }

  get OTEL_PLATFORM(): 'api' {
    return this.env.OTEL_PLATFORM;
  }

  get OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT(): number {
    return this.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
  }

  get REDIS_PROGRESS_BUFFER_DELAY_MS(): number {
    return 120_000;
  }

  get REDIS_PROGRESS_FLUSH_INTERVAL_MS(): number {
    return 15_000;
  }

  get REDIS_PROGRESS_PENDING_TTL_SECONDS(): number {
    return 900;
  }
}
