import {
  CanActivate,
  ExecutionContext,
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

    // Lazy import so jest.mock('./auth.instance', factory) works correctly in tests.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { auth } =
      require('./auth.instance') as typeof import('./auth.instance');

    const request = context.switchToHttp().getRequest<Request>();
    const session = await auth.api.getSession({
      headers: new Headers(request.headers as Record<string, string>),
    });

    if (!session) throw new UnauthorizedException();

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const userRole = session.user.role ?? 'user';
    if (requiredRoles?.length && !requiredRoles.includes(userRole)) {
      throw new UnauthorizedException();
    }

    request.user = {
      ...session.user,
      role: userRole,
    };
    return true;
  }
}
