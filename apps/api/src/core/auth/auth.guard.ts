import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { PrimaryDbService } from '../db/primary-db.service';
import { IS_PUBLIC_KEY } from './decorators';

/** Core API auth.guard module providing shared backend infrastructure and authority-boundary services. */
type SessionBanState = {
  banned?: boolean | null;
  banExpires?: Date | string | null;
};

type AuthenticatedSessionUser = SessionBanState & {
  id: string;
};

@Injectable()
/** NestJS auth guard service or controller coordinating the API boundary for this responsibility. */
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrimaryDbService,
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

    // SAFETY: better-auth's session user includes these persisted ban fields
    // in this app; the runtime source is the authenticated session payload.
    const { banned, banExpires } = session.user as SessionBanState;
    if (banned) {
      const expired = banExpires && new Date(banExpires) <= new Date();
      if (!expired) throw new ForbiddenException('Account is banned');
    }

    // SAFETY: authenticated sessions always carry the user's primary key.
    const sessionUser = session.user as AuthenticatedSessionUser;

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
    const authenticatedUser = {
      ...session.user,
      roles,
      accessGrants: packedAccessGrants,
    };
    // SAFETY: downstream guards/controllers in this app read `request.user`
    // after AuthGuard attaches the authenticated principal for the request.
    (request as Request & { user?: typeof authenticatedUser }).user = authenticatedUser;
    return true;
  }
}
