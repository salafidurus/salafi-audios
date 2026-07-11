import { Module } from '@nestjs/common';
import { AdminPermissionsController } from './admin-permissions.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminPermissionsRepository } from './admin-permissions.repo';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PermissionsModule],
  controllers: [AdminPermissionsController, AdminUsersController],
  providers: [AdminPermissionsService, AdminPermissionsRepository],
  exports: [AdminPermissionsService, AdminPermissionsRepository],
})
export class AdminPermissionsModule {}
