import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { CHECK_POLICY_KEY } from './decorators/check-policy.decorator';
import type {
  CheckPolicyMetadata,
  PolicyRequestContext,
} from './decorators/check-policy.decorator';
import { canAccess, type PolicyResource } from './policy';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<CheckPolicyMetadata | undefined>(
      CHECK_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Routes without @CheckPolicy are guarded only by AuthGuard.
    if (!metadata) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user?.id) throw new ForbiddenException('Authentication required');

    let resource: PolicyResource | undefined;
    if (metadata.resolve) {
      const policyContext: PolicyRequestContext = {
        // SAFETY: Fastify/Nest route params are string-keyed path params at this boundary.
        params: (request.params as Record<string, string>) ?? {},
        body: request.body,
        query: {},
      };
      resource = await metadata.resolve(policyContext, this.prisma);
    }

    if (
      !canAccess(user, {
        action: metadata.action,
        subjectType: metadata.subjectType,
        resource,
        resourceResolved: Boolean(metadata.resolve),
      })
    ) {
      throw new ForbiddenException(
        `Missing capability: ${metadata.action} ${metadata.subjectType}`,
      );
    }

    return true;
  }
}
