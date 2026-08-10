import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '../config/config.service';

const NEON_API_BASE_URL = 'https://console.neon.tech/api/v2';

@Injectable()
export class DbHealthIndicator extends HealthIndicator {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async pingCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
    const timeout = options?.timeout ?? 1000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(
        `${NEON_API_BASE_URL}/projects/${this.config.NEON_PROJECT_ID}/endpoints/${this.config.NEON_ENDPOINT_ID}`,
        {
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${this.config.NEON_API_KEY}`,
          },
          signal: controller.signal,
        },
      );

      if (!response.ok) throw new Error(`Neon API returned HTTP ${response.status}`);

      const body = (await response.json()) as {
        endpoint?: { current_state?: unknown };
      };
      const currentState = body.endpoint?.current_state;
      if (typeof currentState !== 'string' || currentState.length === 0) {
        throw new Error('Neon API response did not include endpoint.current_state');
      }

      return this.getStatus(key, true, { currentState });
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
