import { describe, expect, it } from 'bun:test';
import { ServiceUnavailableException } from '@nestjs/common';
import { AllExceptionsFilter } from './http-exception.filter';

describe('AllExceptionsFilter', () => {
  it('preserves nested health diagnostics from an unavailable response', () => {
    let body: Record<string, unknown> | undefined;
    const response = {
      getHeader: () => undefined,
      status: (_status: number) => ({
        send: (value: Record<string, unknown>) => {
          body = value;
        },
      }),
    };
    const request = { id: 'request-1', url: '/health' };
    const host = {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    };
    const result = {
      status: 'error',
      info: { database: { status: 'up' } },
      error: { cdn: { status: 'down', message: 'Request timeout' } },
      details: {
        database: { status: 'up' },
        cdn: { status: 'down', message: 'Request timeout' },
      },
    };

    new AllExceptionsFilter({ NODE_ENV: 'test' } as never).catch(
      new ServiceUnavailableException(result),
      host as never,
    );

    expect(body).toMatchObject({
      statusCode: 503,
      message: 'Health check failed',
      info: result.info,
      error: result.error,
      details: result.details,
    });
  });
});
