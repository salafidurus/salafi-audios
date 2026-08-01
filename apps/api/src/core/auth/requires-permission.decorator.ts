import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@sd/core-contracts';

export const REQUIRES_PERMISSION_KEY = 'requiresPermission';

/**
 * Decorator to require a specific permission for a route.
 * Used in conjunction with PermissionGuard to enforce PBAC.
 *
 * @param permission - The permission required to access this route
 *
 * @example
 * @RequiresPermission(Permission.LISTINGS_EDIT)
 * @Patch(':id')
 * async updateListing(@Param('id') id: string) { ... }
 */
export const RequiresPermission = (permission: Permission) =>
  SetMetadata(REQUIRES_PERMISSION_KEY, permission);
