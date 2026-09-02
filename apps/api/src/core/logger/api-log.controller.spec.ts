import { describe, expect, it, vi } from 'bun:test';
import { ApiLogController } from './api-log.controller';

function request(url: string) {
  return {
    url,
    raw: { method: 'GET', url },
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  } as any;
}

function reply() {
  return {
    elapsedTime: 12,
    statusCode: 503,
    log: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
  } as any;
}

describe('ApiLogController', () => {
  it('suppresses successful health request lifecycle logs', () => {
    const controller = new ApiLogController();
    const req = request('/health/healthz?probe=1');
    const res = reply();

    controller.incomingRequest(req, res);
    controller.requestCompleted(null, req, res);

    expect(req.log.info).not.toHaveBeenCalled();
    expect(res.log.info).not.toHaveBeenCalled();
  });

  it('retains health request failures in the error log', () => {
    const controller = new ApiLogController();
    const req = request('/health/readyz');
    const res = reply();
    const error = new Error('database unavailable');

    controller.requestCompleted(error, req, res);

    expect(res.log.error).toHaveBeenCalledWith(
      { res, err: error, responseTime: res.elapsedTime },
      'request errored',
    );
  });

  it('retains health errors handled by Fastify', () => {
    const controller = new ApiLogController();
    const req = request('/health');
    const res = reply();
    const error = new Error('health check failed');

    controller.defaultErrorLog(error, req, res);

    expect(res.log.error).toHaveBeenCalledWith({ req, res, err: error }, error.message);
  });

  it('retains less-common health failure callbacks', () => {
    const controller = new ApiLogController();
    const req = request('/health/readyz');
    const res = reply();
    const error = new Error('probe transport failed');

    controller.streamError(error, req, res);
    controller.routeNotFound(req, res);
    controller.writeHeadError(error, req, res);
    controller.serializerError(error, req, res, { statusCode: 503 });

    expect(res.log.warn).toHaveBeenCalledWith(
      { err: error },
      'response terminated with an error with headers already sent',
    );
    expect(req.log.info).toHaveBeenCalledWith('Route GET:/health/readyz not found');
    expect(res.log.warn).toHaveBeenCalledWith({ req, res, err: error }, error.message);
    expect(res.log.error).toHaveBeenCalledWith(
      { err: error, statusCode: 503 },
      'The serializer for the given status code failed',
    );
  });
});
