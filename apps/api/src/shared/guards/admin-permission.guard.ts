import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Permission } from '@sd/core-db';
import { REQUIRES_PERMISSION_KEY } from '../decorators/requires-permission.decorator';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<Permission>(
      REQUIRES_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Routes without @RequiresPermission are guarded only by AuthGuard — this guard is a
    // layer on top, not a replacement. Returning true here lets AuthGuard's decision stand.
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string } | undefined;

    if (!user?.id) throw new ForbiddenException('Authentication required');

    const permission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId: user.id,
          permission: requiredPermission,
        },
      },
    });

    if (!permission) {
      throw new ForbiddenException(`Missing permission: ${requiredPermission}`);
    }

    return true;
  }
}
