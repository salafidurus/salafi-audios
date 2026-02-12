import { Injectable } from '@nestjs/common';
import { getApiEnv } from '@sd/env/api';

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

  get DATABASE_URL() {
    return this.env.DATABASE_URL;
  }

  get ASSET_CDN_BASE_URL(): string | undefined {
    return this.env.ASSET_CDN_BASE_URL;
  }
}
