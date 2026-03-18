import { Injectable } from '@nestjs/common';
import { getApiEnv } from '@sd/env';

@Injectable()
export class ConfigService {
  private readonly env = getApiEnv(process.env);

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

  get DATABASE_URL(): string {
    return this.env.DATABASE_URL;
  }

  get ASSET_CDN_BASE_URL(): string | undefined {
    return this.env.ASSET_CDN_BASE_URL;
  }

  // better-auth
  get BETTER_AUTH_SECRET(): string {
    return this.env.BETTER_AUTH_SECRET;
  }

  get BETTER_AUTH_URL(): string {
    return this.env.BETTER_AUTH_URL;
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
}
