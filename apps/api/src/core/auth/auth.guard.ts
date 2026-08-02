import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import { PrismaService } from '../db/prisma.service';
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

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const sessionUser = session.user as {
      id: string;
      roles?: string[];
      permissions?: string[];
      scholarLinks?: { scholarId: string; permissionType: string }[];
      translatorRoles?: { scholarId: string | null; locale: string; canPublish: boolean }[];
      banned?: boolean | null;
      banExpires?: Date | string | null;
    };

    let roles: string[] = sessionUser.roles || [];

    if (!roles.length) {
      const userRoles = await this.prisma.userRoleAssignment.findMany({
        where: { userId: sessionUser.id },
        select: { role: true },
      });
      roles = userRoles.map((r) => r.role);
      if (!roles.length) {
        roles = ['listener'];
      }
    }

    // If specific roles are required via @Roles decorator, check if user has one of them
    if (requiredRoles?.length) {
      const roleSet = new Set(roles);
      if (!requiredRoles.some((r) => roleSet.has(r as string))) {
        throw new UnauthorizedException();
      }
    }

    let permissions: string[] = sessionUser.permissions || [];
    if (!permissions.length) {
      const userPermissions = await this.prisma.userPermission.findMany({
        where: { userId: sessionUser.id },
        select: { permission: true },
      });
      permissions = userPermissions.map((p) => p.permission);
    }

    let scholarLinks = sessionUser.scholarLinks || [];
    if (!scholarLinks.length) {
      const userScholarRoles = await this.prisma.userScholarRole.findMany({
        where: { userId: sessionUser.id },
        select: { scholarId: true, permissionType: true },
      });
      scholarLinks = userScholarRoles.map((s) => ({
        scholarId: s.scholarId,
        permissionType: s.permissionType,
      }));
    }

    let translatorRoles = sessionUser.translatorRoles || [];
    if (!translatorRoles.length) {
      const userTranslatorRoles = await this.prisma.userTranslatorRole.findMany({
        where: { userId: sessionUser.id },
        select: { scholarId: true, locale: true, canPublish: true },
      });
      translatorRoles = userTranslatorRoles.map((t) => ({
        scholarId: t.scholarId,
        locale: t.locale,
        canPublish: t.canPublish,
      }));
    }

    // Attach user info to request (for use by controllers and other services)
    (request as any).user = {
      ...session.user,
      roles,
      permissions,
      scholarLinks,
      translatorRoles,
    };
    return true;
  }
}
