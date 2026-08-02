import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { subject } from '@casl/ability';
import type { Request } from 'express';
import { CHECK_POLICY_KEY } from './decorators/check-policy.decorator';
import type { CheckPolicyMetadata } from './decorators/check-policy.decorator';
import { defineAbilityFor } from './ability/ability.factory';
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

    // Routes without @CheckPolicy are guarded only by AuthGuard (or a
    // still-migrating @RequiresPermission, enforced by PermissionGuard).
    if (!metadata) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user;
    if (!user?.id) throw new ForbiddenException('Authentication required');

    const ability = defineAbilityFor(user);

    let resource: Record<string, unknown> | undefined;
    if (metadata.resolve) {
      resource = await metadata.resolve(
        {
          params: (request.params as Record<string, string>) ?? {},
          body: request.body,
          query: (request.query as Record<string, unknown>) ?? {},
        },
        this.prisma,
      );
    }

    // The resolver's return shape is only known at each @CheckPolicy call site,
    // not to this generic guard — the cast below is the dynamic-dispatch
    // boundary; correctness is verified by ability.factory/policy.guard specs.
    const target = resource
      ? subject(metadata.subjectType, resource as never)
      : metadata.subjectType;
    if (!ability.can(metadata.action, target)) {
      throw new ForbiddenException(
        `Missing capability: ${metadata.action} ${metadata.subjectType}`,
      );
    }

    return true;
  }
}
