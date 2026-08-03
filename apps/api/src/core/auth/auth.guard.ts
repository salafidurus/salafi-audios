import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { PrismaService } from '../db/prisma.service';
import { IS_PUBLIC_KEY } from './decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Lazy import so vi.mock('./auth.instance', factory) works correctly in tests.
    const { getAuth } = await import('./auth.instance');

    const request = context.switchToHttp().getRequest<Request>();
    const session = await getAuth().api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) throw new UnauthorizedException();

    const { banned, banExpires } = session.user as {
      banned?: boolean | null;
      banExpires?: Date | string | null;
    };
    if (banned) {
      const expired = banExpires && new Date(banExpires) <= new Date();
      if (!expired) throw new ForbiddenException('Account is banned');
    }

    const sessionUser = session.user as {
      id: string;
      banned?: boolean | null;
      banExpires?: Date | string | null;
    };

    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: { userId: sessionUser.id },
      select: { role: true },
    });
    const roles = userRoles.map((r) => r.role);
    if (!roles.length) {
      roles.push('listener');
    }

    const accessGrants = await this.prisma.userAccessGrant.findMany({
      where: { userId: sessionUser.id },
      select: {
        target: true,
        capability: true,
        locale: true,
        scholar: { select: { slug: true } },
      },
    });
    const packedAccessGrants = accessGrants.map(({ scholar, ...grant }) => ({
      ...grant,
      scholarSlug: scholar?.slug ?? null,
    }));

    // Attach user info to request (for use by controllers and other services)
    (request as any).user = {
      ...session.user,
      roles,
      accessGrants: packedAccessGrants,
    };
    return true;
  }
}
