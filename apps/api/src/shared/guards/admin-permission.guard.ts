import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { REQUIRES_PERMISSION_KEY } from '../decorators/requires-permission.decorator';
import { PrismaService } from '../db/prisma.service';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRES_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as { id: string } | undefined;

    if (!user?.id) throw new ForbiddenException('Authentication required');

    const permission = await this.prisma.adminPermission.findUnique({
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
