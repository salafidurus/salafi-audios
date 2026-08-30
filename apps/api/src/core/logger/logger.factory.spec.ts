import { describe, expect, it } from 'bun:test';
import Fastify from 'fastify';
import { generateRequestId, isHealthProbePath, loggerOptionsFor } from './logger.factory';
import { ApiLogController } from './api-log.controller';

describe('logger factory', () => {
  it('recognizes all health probe paths including query strings', () => {
    expect(isHealthProbePath('/health')).toBe(true);
    expect(isHealthProbePath('/health/healthz?probe=1')).toBe(true);
    expect(isHealthProbePath('/health/readyz')).toBe(true);
    expect(isHealthProbePath('/health/other')).toBe(false);
    expect(isHealthProbePath('/account/profile')).toBe(false);
  });

  it('keeps structured redaction and environment-specific transport settings', () => {
    const development = loggerOptionsFor('development');
    const production = loggerOptionsFor('production');

    expect(development.transport).toEqual({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        singleLine: false,
      },
    });
    expect(production.transport).toBeUndefined();
    expect(development.redact).toEqual({
      paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.set-cookie'],
      remove: true,
    });
  });

  it('preserves a valid request ID and replaces missing or malformed IDs', () => {
    expect(generateRequestId({ 'x-request-id': ' request-123 ' })).toBe('request-123');
    expect(generateRequestId({ 'x-request-id': ['request-123'] })).toMatch(/^[0-9a-f-]{36}$/);
    expect(generateRequestId({})).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('validates inbound IDs through Fastify and returns the effective ID', async () => {
    const app = Fastify({
      logger: false,
      genReqId: (request) => generateRequestId(request.headers),
      logController: new ApiLogController(),
    });
    app.addHook('onRequest', (request, reply, done) => {
      reply.header('x-request-id', request.id);
      done();
    });
    app.get('/health/healthz', async () => ({ status: 'ok' }));

    const validResponse = await app.inject({
      method: 'GET',
      url: '/health/healthz',
      headers: { 'x-request-id': 'probe-123' },
    });
    const malformedResponse = await app.inject({
      method: 'GET',
      url: '/health/healthz',
      headers: { 'x-request-id': '   ' },
    });

    expect(validResponse.headers['x-request-id']).toBe('probe-123');
    expect(malformedResponse.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    await app.close();
  });
});
