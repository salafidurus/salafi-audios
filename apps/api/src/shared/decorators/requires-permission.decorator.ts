import { SetMetadata } from '@nestjs/common';

export const REQUIRES_PERMISSION_KEY = 'requiresPermission';

export const RequiresPermission = (permission: string) =>
  SetMetadata(REQUIRES_PERMISSION_KEY, permission);
