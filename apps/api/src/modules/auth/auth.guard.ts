import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../../shared/db/prisma.service';
import { IS_PUBLIC_KEY, ROLES_KEY } from './decorators';

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
      headers: new Headers(request.headers as Record<string, string>),
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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Fetch user's roles from UserRoleAssignment table
    const userRoles = await this.prisma.userRoleAssignment.findMany({
      where: { userId: session.user.id },
      select: { role: true },
    });

    let roles: string[] = userRoles.map((r) => r.role);

    // If user has no roles (edge case: race condition during OAuth), assign default 'listener' role
    if (!roles.length) {
      try {
        await this.prisma.userRoleAssignment.create({
          data: {
            userId: session.user.id,
            role: 'listener',
            grantedAt: new Date(),
          },
        });
        roles = ['listener'];
      } catch {
        // If creation fails (e.g., unique constraint), fetch again
        const retryRoles = await this.prisma.userRoleAssignment.findMany({
          where: { userId: session.user.id },
          select: { role: true },
        });
        roles = retryRoles.map((r) => r.role);

        // Still no roles after retry, reject the request
        if (!roles.length) throw new UnauthorizedException();
      }
    }

    // If specific roles are required via @Roles decorator, check if user has one of them
    if (requiredRoles?.length && !requiredRoles.some((r) => roles.includes(r as string))) {
      throw new UnauthorizedException();
    }

    // Attach user info to request (for use by controllers and other services)
    request.user = {
      ...session.user,
      roles, // Attach actual roles from database
    };
    return true;
  }
}
