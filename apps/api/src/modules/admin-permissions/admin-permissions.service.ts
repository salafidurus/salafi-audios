import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ADMIN_PERMISSIONS, type AdminPermission } from '@sd/core-contracts';
import { AdminPermissionsRepository } from './admin-permissions.repo';

@Injectable()
export class AdminPermissionsService {
  constructor(private readonly repo: AdminPermissionsRepository) {}

  async getPermissions(userId: string) {
    const perms = await this.repo.findByUserId(userId);
    return {
      permissions: perms.map((p) => ({
        userId: p.userId,
        permission: p.permission as AdminPermission,
        grantedAt: p.grantedAt.toISOString(),
        grantedById: p.grantedById,
      })),
    };
  }

  async getMyPermissions(
    userId: string,
  ): Promise<{ permissions: AdminPermission[] }> {
    const strings = await this.repo.findPermissionStringsByUserId(userId);
    return {
      permissions: strings as AdminPermission[],
    };
  }

  async grant(userId: string, permission: string, grantedById: string) {
    if (!ADMIN_PERMISSIONS.includes(permission as AdminPermission)) {
      throw new NotFoundException(`Unknown permission: ${permission}`);
    }
    await this.repo.grant(userId, permission, grantedById);
    return this.getPermissions(userId);
  }

  async revoke(userId: string, permission: string) {
    if (!ADMIN_PERMISSIONS.includes(permission as AdminPermission)) {
      throw new NotFoundException(`Unknown permission: ${permission}`);
    }
    const has = await this.repo.hasPermission(userId, permission);
    if (!has) {
      throw new NotFoundException(
        `User does not have permission: ${permission}`,
      );
    }
    await this.repo.revoke(userId, permission);
    return this.getPermissions(userId);
  }
}
