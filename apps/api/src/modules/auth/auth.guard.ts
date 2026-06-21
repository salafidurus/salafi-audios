import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY, ROLES_KEY } from './decorators';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!session.user.role) throw new UnauthorizedException();

    if (requiredRoles?.length && !requiredRoles.includes(session.user.role)) {
      throw new UnauthorizedException();
    }

    request.user = {
      ...session.user,
      role: session.user.role,
    };
    return true;
  }
}
