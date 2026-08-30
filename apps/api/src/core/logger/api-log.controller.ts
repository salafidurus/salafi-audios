import { LogController } from 'fastify';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { isHealthProbePath } from './logger.factory';

/**
 * Defines the API's Fastify request lifecycle policy, suppressing successful
 * health-probe noise while retaining every failure signal emitted by Fastify.
 */

type SerializerErrorMetadata = {
  /** HTTP status whose response serializer failed. */
  statusCode: number;
};

/**
 * Owns Fastify's request-lifecycle logging policy for the API. Successful
 * health probes are quiet, while health failures remain visible through the
 * same structured Pino destination as ordinary request failures.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- Fastify inheritance exposes the operational contract documented above.
export class ApiLogController extends LogController {
  constructor() {
    super({ disableRequestLogging: (request) => isHealthProbePath(request.url) });
  }

  /** Suppresses successful health completions but keeps request failures visible. */
  override requestCompleted(
    error: Error | null | undefined,
    request: FastifyRequest,
    reply: FastifyReply,
  ): void {
    if (error) {
      reply.log.error(
        { res: reply, err: error, responseTime: reply.elapsedTime },
        'request errored',
      );
      return;
    }

    super.requestCompleted(error, request, reply);
  }

  /** Keeps errors visible even when the failed URL is a health probe. */
  override defaultErrorLog(error: Error, request: FastifyRequest, reply: FastifyReply): void {
    if (this.isLogDisabled(request)) {
      if (reply.statusCode >= 500) {
        reply.log.error({ req: request, res: reply, err: error }, error.message);
      } else {
        reply.log.info({ res: reply, err: error }, error.message);
      }
      return;
    }

    super.defaultErrorLog(error, request, reply);
  }

  /** Keeps stream failures visible when health request logging is disabled. */
  override streamError(error: Error, request: FastifyRequest, reply: FastifyReply): void {
    if (this.isLogDisabled(request)) {
      reply.log.warn({ err: error }, 'response terminated with an error with headers already sent');
      return;
    }

    super.streamError(error, request, reply);
  }

  /** Keeps missing health routes visible as probe failures. */
  override routeNotFound(request: FastifyRequest, reply: FastifyReply): void {
    if (this.isLogDisabled(request)) {
      request.log.info(`Route ${request.raw.method}:${request.raw.url} not found`);
      return;
    }

    super.routeNotFound(request, reply);
  }

  /** Keeps write-head failures visible when a health response cannot be sent. */
  override writeHeadError(error: Error, request: FastifyRequest, reply: FastifyReply): void {
    if (this.isLogDisabled(request)) {
      reply.log.warn({ req: request, res: reply, err: error }, error.message);
      return;
    }

    super.writeHeadError(error, request, reply);
  }

  /** Keeps serializer failures visible for health responses. */
  override serializerError(
    error: Error,
    request: FastifyRequest,
    reply: FastifyReply,
    metadata: SerializerErrorMetadata,
  ): void {
    if (this.isLogDisabled(request)) {
      reply.log.error(
        { err: error, statusCode: metadata.statusCode },
        'The serializer for the given status code failed',
      );
      return;
    }

    super.serializerError(error, request, reply, metadata);
  }
}
