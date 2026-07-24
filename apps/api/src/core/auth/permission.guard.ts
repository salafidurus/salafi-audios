import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import type { Permission, UserRole } from '@sd/core-db';
import { REQUIRES_PERMISSION_KEY } from './requires-permission.decorator';
import { PrismaService } from '../db/prisma.service';

/**
 * Permission-Based Access Control Guard
 *
 * Enforces granular permission checking with support for:
 * - Global permissions (admin, editor, etc.)
 * - Scholar-scoped permissions (edit only assigned scholars)
 * - Language-scoped permissions (translate to assigned languages)
 * - Superadmin bypass (bypass all checks)
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission | undefined>(
      REQUIRES_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Routes without @RequiresPermission are guarded only by AuthGuard
    if (!requiredPermission) return true;

    const request = context
      .switchToHttp()
      .getRequest<
        FastifyRequest & { user?: { id: string; roles?: string[]; permissions?: string[] } }
      >();
    const user = request.user;

    if (!user?.id) throw new ForbiddenException('Authentication required');

    // Fast path: session roles and permissions
    if (user.roles?.includes('superadmin')) return true;
    if (user.permissions?.includes(requiredPermission as string)) return true;

    // DB Fallback: Check if user has superadmin role
    const isSuperadmin = await this.hasRole(user.id, 'superadmin');
    if (isSuperadmin) return true;

    // DB Fallback: Check if user has the required permission
    const hasPermission = await this.hasPermission(user.id, requiredPermission);
    if (!hasPermission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    return true;
  }

  /**
   * Check if a user has a specific role
   */
  private async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roleAssignment = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
    });
    return !!roleAssignment;
  }

  /**
   * Check if a user has a specific permission
   */
  private async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
    });
    return !!userPermission;
  }
}
