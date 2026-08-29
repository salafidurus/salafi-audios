import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

/** Core API health service module owning dependency aggregation and diagnostics. */
/**
 * Defines the dependency-status contract consumed by the health aggregator.
 * `up` means the requested check is available; `down` makes the aggregate
 * health response fail and exposes the probe's diagnostics.
 */
export type HealthIndicatorStatus = 'up' | 'down';

/** Scalar metadata emitted by dependency probes. */
export type HealthIndicatorMetadata = string | number | boolean | null;

/** A named dependency result with optional diagnostic metadata. */
export type HealthIndicatorResult = Record<
  string,
  {
    /** Determines whether this dependency contributes to the healthy aggregate. */
    status: HealthIndicatorStatus;
    [key: string]: HealthIndicatorMetadata;
  }
>;

/** The operational response shared by full, readiness, and liveness probes. */
export type HealthCheckResult = {
  /** API status semantics: `ok` means every supplied probe passed; `error` means one failed. */
  status: 'ok' | 'error';
  /** Healthy dependency results, or an empty object when none were supplied. */
  info: HealthIndicatorResult;
  /** Failed dependency results, or an empty object when all probes passed. */
  error: HealthIndicatorResult;
  /** Combined diagnostic view of both healthy and failed dependencies. */
  details: HealthIndicatorResult;
};

/** A dependency probe that returns one or more named health results. */
export type HealthProbe = () => Promise<HealthIndicatorResult>;

/**
 * Represents an expected dependency failure while retaining its public health
 * result for aggregation and HTTP diagnostics.
 */
export class HealthCheckError extends Error {
  constructor(
    message: string,
    readonly causes: HealthIndicatorResult,
  ) {
    super(message);
    this.name = 'HealthCheckError';
  }
}

@Injectable()
/**
 * Aggregates application-owned dependency probes and preserves the health
 * endpoint contract previously supplied by the former health library.
 * Expected probe failures are logged and surfaced as HTTP 503 responses with
 * dependency diagnostics; unexpected programming errors are allowed to
 * propagate.
 */
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  async check(probes: HealthProbe[]): Promise<HealthCheckResult> {
    const results: HealthIndicatorResult[] = [];
    const errors: HealthIndicatorResult[] = [];
    const settled = await Promise.allSettled(probes.map((probe) => probe()));

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        this.collect(result.value, results, errors);
        continue;
      }

      if (!(result.reason instanceof HealthCheckError)) throw result.reason;
      errors.push(result.reason.causes);
    }

    const info = this.summarize(results);
    const error = this.summarize(errors);
    const healthResult: HealthCheckResult = {
      status: errors.length > 0 ? 'error' : 'ok',
      info,
      error,
      details: { ...info, ...error },
    };

    if (healthResult.status === 'error') {
      this.logger.error({ error: healthResult.error }, 'Health check failed');
      throw new ServiceUnavailableException(healthResult);
    }

    return healthResult;
  }

  private collect(
    result: HealthIndicatorResult,
    healthy: HealthIndicatorResult[],
    unhealthy: HealthIndicatorResult[],
  ): void {
    for (const [key, value] of Object.entries(result)) {
      (value.status === 'up' ? healthy : unhealthy).push({ [key]: value });
    }
  }

  private summarize(results: HealthIndicatorResult[]): HealthIndicatorResult {
    return Object.assign({}, ...results);
  }
}

/** Builds a named result while preventing metadata from overriding its status. */
export function createHealthIndicatorResult(
  key: string,
  status: HealthIndicatorStatus,
  metadata: Record<string, HealthIndicatorMetadata> = {},
): HealthIndicatorResult {
  // oxlint-disable-next-line anti-slop/no-known-value-widening -- Probe keys are dynamic by contract.
  return { [key]: { ...metadata, status } } satisfies HealthIndicatorResult;
}
