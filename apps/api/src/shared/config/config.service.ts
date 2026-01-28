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

  // add more as you need them later (e.g., DATABASE_URL, CORS_ORIGINS, etc.)
}
