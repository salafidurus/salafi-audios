import { describe, expect, it } from 'bun:test';
import {
  type TelemetryEnvironment,
  getTelemetryResourceAttributes,
  isTelemetryConfigured,
} from './telemetry.service';

const baseEnv = {
  OTEL_SERVICE_NAME: 'salafi-durus-api',
  NODE_ENV: 'production',
  OTEL_DEPLOYMENT_VERSION: 'release-123',
  OTEL_PLATFORM: 'api',
  OTEL_ENVIRONMENT: 'preview',
  OTEL_REGION: 'eu-west-1',
  OTEL_EXPORTER_OTLP_ENDPOINT: undefined,
  OTEL_EXPORTER_OTLP_HEADERS: undefined,
} satisfies TelemetryEnvironment;

describe('operational telemetry configuration', () => {
  it('requires both an OTLP endpoint and exporter headers', () => {
    expect(isTelemetryConfigured(baseEnv)).toBe(false);
    expect(
      isTelemetryConfigured({
        ...baseEnv,
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://otlp.nr-data.net',
      }),
    ).toBe(false);
    expect(
      isTelemetryConfigured({
        ...baseEnv,
        OTEL_EXPORTER_OTLP_HEADERS: 'api-key=secret',
      }),
    ).toBe(false);
    expect(
      isTelemetryConfigured({
        ...baseEnv,
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://otlp.nr-data.net',
        OTEL_EXPORTER_OTLP_HEADERS: 'api-key=secret',
      }),
    ).toBe(true);
  });

  it('builds stable resource attributes without user or request identifiers', () => {
    expect(getTelemetryResourceAttributes(baseEnv)).toEqual({
      'service.name': 'salafi-durus-api',
      'deployment.environment.name': 'preview',
      'service.version': 'release-123',
      'deployment.version': 'release-123',
      'service.namespace': 'salafi-durus',
      'service.instance.id': 'api',
      'cloud.region': 'eu-west-1',
    });
  });
});
