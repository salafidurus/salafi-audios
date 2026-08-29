import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import '@fastify/rate-limit';
import { HttpAdapterHost, Reflector } from '@nestjs/core';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { ConfigService } from '../config/config.service';
import { IS_PUBLIC_KEY } from '../auth/decorators';
import { RATE_LIMIT_POLICY_KEY } from './rate-limit.decorator';
import {
  getRateLimitIdentity,
  getRateLimitPolicy,
  resolveRateLimitPolicy,
  type RateLimitPolicy,
  type RateLimitPolicyName,
} from './rate-limit.policy';

/** Core API rate-limit guard module enforcing named policies at the request boundary. */
@Injectable()
/**
 * Applies the named API policy after authentication has attached any trusted
 * principal to the request. Fastify owns counter mechanics; this guard owns
 * route classification and the stable rejection response.
 */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class RateLimitGuard implements CanActivate {
  private readonly limiters = new Map<
    RateLimitPolicyName,
    ReturnType<FastifyInstance['createRateLimit']>
  >();

  constructor(
    private readonly reflector: Reflector,
    private readonly adapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.config.DISABLE_THROTTLER) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const explicitPolicy = this.reflector.getAllAndOverride<RateLimitPolicyName>(
      RATE_LIMIT_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    const policyName = resolveRateLimitPolicy(explicitPolicy, Boolean(isPublic));
    const policy = getRateLimitPolicy(policyName, this.config.NODE_ENV);

    if (policy.appliesGlobalSafety) {
      await this.enforce(
        request,
        context,
        getRateLimitPolicy('global-safety', this.config.NODE_ENV),
      );
    }
    await this.enforce(request, context, policy);
    return true;
  }

  private async enforce(
    request: FastifyRequest,
    context: ExecutionContext,
    policy: RateLimitPolicy,
  ): Promise<void> {
    const result = await this.getLimiter(policy)(request);
    if (result.isAllowed) return;
    if (!result.isExceeded) return;

    const reply = context.switchToHttp().getResponse<FastifyReply>();
    reply.header('x-ratelimit-limit', result.max);
    reply.header('x-ratelimit-remaining', result.remaining);
    reply.header('x-ratelimit-reset', result.ttlInSeconds);
    reply.header('retry-after', result.ttlInSeconds);
    throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
  }

  private getLimiter(policy: RateLimitPolicy) {
    const existing = this.limiters.get(policy.name);
    if (existing) return existing;

    // SAFETY: The API is created with FastifyAdapter, so this adapter instance
    // exposes the rate-limit plugin registered during application bootstrap.
    const fastify = this.adapterHost.httpAdapter.getInstance() as FastifyInstance;
    const limiter = fastify.createRateLimit({
      max: policy.limit,
      timeWindow: policy.timeWindowMs,
      skipOnError: policy.failureMode === 'open',
      keyGenerator: (request) => `${policy.name}:${getRateLimitIdentity(request)}`,
    });
    this.limiters.set(policy.name, limiter);
    return limiter;
  }
}
