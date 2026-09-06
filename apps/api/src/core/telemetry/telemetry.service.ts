import { Injectable, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { metrics } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import type { Attributes } from '@opentelemetry/api';
import { ConfigService } from '../config/config.service';
import { AppLoggerService } from '../logger/app-logger.service';

/** The validated configuration fields consumed by the telemetry boundary. */
export type TelemetryEnvironment = Pick<
  import('../config/env').ApiEnv,
  | 'OTEL_EXPORTER_OTLP_ENDPOINT'
  | 'OTEL_EXPORTER_OTLP_HEADERS'
  | 'OTEL_SERVICE_NAME'
  | 'NODE_ENV'
  | 'OTEL_DEPLOYMENT_VERSION'
  | 'OTEL_PLATFORM'
  | 'OTEL_ENVIRONMENT'
  | 'OTEL_REGION'
>;

/** Returns whether the API has enough configuration to export telemetry safely. */
export function isTelemetryConfigured(
  env: Pick<TelemetryEnvironment, 'OTEL_EXPORTER_OTLP_ENDPOINT' | 'OTEL_EXPORTER_OTLP_HEADERS'>,
): boolean {
  return Boolean(env.OTEL_EXPORTER_OTLP_ENDPOINT && env.OTEL_EXPORTER_OTLP_HEADERS);
}

/** Builds deployment-level attributes shared by traces, metrics, and logs. */
export function getTelemetryResourceAttributes(
  env: Pick<
    TelemetryEnvironment,
    'OTEL_SERVICE_NAME' | 'NODE_ENV' | 'OTEL_DEPLOYMENT_VERSION' | 'OTEL_PLATFORM' | 'OTEL_REGION'
  >,
): Attributes {
  return {
    'service.name': env.OTEL_SERVICE_NAME,
    'deployment.environment.name': env.OTEL_ENVIRONMENT ?? env.NODE_ENV,
    'service.version': env.OTEL_DEPLOYMENT_VERSION,
    'deployment.version': env.OTEL_DEPLOYMENT_VERSION,
    'service.namespace': 'salafi-durus',
    'service.instance.id': env.OTEL_PLATFORM,
    'cloud.region': env.OTEL_REGION,
  };
}

/** Owns optional OpenTelemetry SDK startup without making API availability depend on exporters. */
@Injectable()
export class TelemetryService implements OnModuleInit, OnApplicationShutdown {
  private sdk: NodeSDK | undefined;
  private readonly meter = metrics.getMeter('salafi-durus-api');
  private readonly analyticsStageCounter = this.meter.createCounter(
    'salafi_durus_analytics_events_total',
    { description: 'Analytics events observed at each API pipeline stage' },
  );
  private readonly httpRequestCounter = this.meter.createCounter(
    'salafi_durus_http_requests_total',
    {
      description: 'API requests completed by method and status class',
    },
  );
  private readonly httpRequestDuration = this.meter.createHistogram(
    'salafi_durus_http_request_duration_ms',
    { description: 'API request duration in milliseconds' },
  );

  public constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLoggerService,
  ) {}

  onModuleInit(): void {
    if (!isTelemetryConfigured(this.config)) {
      this.logger.debug('OpenTelemetry exporter is disabled; no complete OTLP configuration found');
      return;
    }

    try {
      this.sdk = new NodeSDK({
        autoDetectResources: false,
        resource: resourceFromAttributes(getTelemetryResourceAttributes(this.config)),
        instrumentations: [
          new HttpInstrumentation(),
          new PgInstrumentation(),
          new IORedisInstrumentation(),
        ],
      });
      this.sdk.start();
      this.logger.info(
        {
          service: this.config.OTEL_SERVICE_NAME,
          environment: this.config.OTEL_ENVIRONMENT ?? this.config.NODE_ENV,
        },
        'OpenTelemetry SDK started',
      );
    } catch (error) {
      this.sdk = undefined;
      this.logger.warn(
        { error: error instanceof Error ? error : String(error) },
        'OpenTelemetry SDK failed to start; continuing without export',
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (!this.sdk) return;
    try {
      await this.sdk.shutdown();
    } catch (error) {
      this.logger.warn(
        { error: error instanceof Error ? error : String(error) },
        'OpenTelemetry SDK failed to shut down cleanly',
      );
    }
  }

  /** Records a bounded analytics pipeline stage without event payload attributes. */
  recordAnalyticsStage(
    stage: 'received' | 'accepted' | 'deduplicated' | 'dropped' | 'failed',
    count = 1,
  ): void {
    this.analyticsStageCounter.add(count, { stage });
  }

  /** Records API latency and outcome using bounded transport-level dimensions. */
  recordHttpRequest(method: string, statusCode: number, durationMs: number): void {
    const statusClass = `${Math.floor(statusCode / 100)}xx`;
    this.httpRequestCounter.add(1, { method, status_class: statusClass });
    this.httpRequestDuration.record(durationMs, { method, status_class: statusClass });
  }
}
