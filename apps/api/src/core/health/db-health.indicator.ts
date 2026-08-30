import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ConfigService } from '../config/config.service';
import {
  createHealthIndicatorResult,
  HealthCheckError,
  type HealthIndicatorResult,
} from './health.service';

/** Core API db health.indicator module providing shared backend infrastructure and authority-boundary services. */
const NEON_API_BASE_URL = 'https://console.neon.tech/api/v2';
const neonEndpointSchema = z.object({
  endpoint: z.object({ current_state: z.string().min(1) }).optional(),
});

function isNeonConfigured(config: ConfigService): boolean {
  return Boolean(config.NEON_API_KEY && config.NEON_PROJECT_ID && config.NEON_ENDPOINT_ID);
}

@Injectable()
/** NestJS db health indicator service or controller coordinating the API boundary for this responsibility. */
export class DbHealthIndicator {
  constructor(private readonly config: ConfigService) {}

  async pingCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
    // Local/dev deployments run without Neon control-plane credentials; the
    // env schema still requires them outside development, so a skip here
    // never masks a misconfigured deployment. Real connectivity is
    // exercised by every Prisma-backed request.
    if (!isNeonConfigured(this.config)) {
      return createHealthIndicatorResult(key, 'up', {
        currentState: 'unknown',
        neonConfigured: false,
      });
    }

    const timeout = options?.timeout ?? 1000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetchNeonEndpoint(this.config, controller.signal);

      const currentState = await readNeonState(response);

      return createHealthIndicatorResult(key, 'up', { currentState });
    } catch (error) {
      throw new HealthCheckError(
        'Database check failed',
        createHealthIndicatorResult(key, 'down', {
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    } finally {
      clearTimeout(timer);
    }
  }
}

async function readNeonState(response: Response): Promise<string> {
  if (!response.ok) throw new Error(`Neon API returned HTTP ${response.status}`);
  const body = neonEndpointSchema.safeParse(await response.json());
  const currentState = body.success ? body.data.endpoint?.current_state : undefined;
  if (!currentState) throw new Error('Neon API response did not include endpoint.current_state');
  return currentState;
}

function fetchNeonEndpoint(config: ConfigService, signal: AbortSignal): Promise<Response> {
  return fetch(
    `${NEON_API_BASE_URL}/projects/${config.NEON_PROJECT_ID}/endpoints/${config.NEON_ENDPOINT_ID}`,
    {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${config.NEON_API_KEY}`,
      },
      signal,
    },
  );
}
