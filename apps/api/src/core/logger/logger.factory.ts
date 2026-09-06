import pino from 'pino';
import type { Logger, LoggerOptions } from 'pino';
import type { IncomingHttpHeaders } from 'node:http';
import crypto from 'node:crypto';
import { z } from 'zod';
import { trace } from '@opentelemetry/api';

/** API logger construction and request-path policy helpers. */

const healthProbePaths = new Set(['/health', '/health/healthz', '/health/readyz']);

/** Injection token for the process-wide Pino instance shared by API logging seams. */
export const API_LOGGER = Symbol('API_LOGGER');

/** Header used to correlate HTTP responses and log entries with one request. */
export const REQUEST_ID_HEADER = 'x-request-id';

/** Safe correlation fields shared by request logs and OpenTelemetry spans. */
export type TelemetryCorrelationFields = {
  request_id: string;
  trace_id?: string;
  span_id?: string;
};

let sharedApiLogger: Logger | undefined;
const requestIdSchema = z.string().trim().min(1);

/** Returns the pathname portion of a Fastify request URL. */
function pathnameOf(url: string): string {
  return new URL(url, 'http://localhost').pathname;
}

/**
 * Identifies the API's operational health probes, including requests carrying
 * query parameters that should not turn a probe into ordinary access noise.
 */
export function isHealthProbePath(url: string): boolean {
  return healthProbePaths.has(pathnameOf(url));
}

/** Reuses a valid inbound request ID or creates one for malformed/missing IDs. */
export function generateRequestId(headers: IncomingHttpHeaders): string {
  const requestId = headers[REQUEST_ID_HEADER];
  const parsedRequestId = requestIdSchema.safeParse(requestId);
  return parsedRequestId.success ? parsedRequestId.data : crypto.randomUUID();
}

/** Returns request and active trace identifiers without copying request payload data. */
export function getTelemetryCorrelationFields(requestId: string): TelemetryCorrelationFields {
  const spanContext = trace.getActiveSpan()?.spanContext();
  const fields: TelemetryCorrelationFields = { request_id: requestId };
  if (spanContext?.traceId && spanContext.spanId) {
    fields.trace_id = spanContext.traceId;
    fields.span_id = spanContext.spanId;
  }
  return fields;
}

/** Builds the shared Pino options while preserving the API's log contract. */
export function loggerOptionsFor(nodeEnvironment: string): LoggerOptions {
  return {
    transport:
      nodeEnvironment === 'production'
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              singleLine: false,
            },
          },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.set-cookie'],
      remove: true,
    },
  };
}

/** Creates the Pino instance shared by Fastify and application logging. */
export function createApiLogger(nodeEnvironment: string): Logger {
  return pino(loggerOptionsFor(nodeEnvironment));
}

/** Returns the one Pino instance used by Fastify and Nest application logging. */
export function getSharedApiLogger(nodeEnvironment: string): Logger {
  sharedApiLogger ??= createApiLogger(nodeEnvironment);
  return sharedApiLogger;
}
