import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsController } from './permissions.controller';
import { AdminUsersController } from '../admin-permissions/admin-users.controller';

@Module({
  controllers: [PermissionsController, AdminUsersController],
  providers: [PermissionsService, PermissionsRepository],
  exports: [PermissionsService, PermissionsRepository],
})
export class PermissionsModule {}
