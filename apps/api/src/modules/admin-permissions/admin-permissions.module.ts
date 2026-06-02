import { Module } from '@nestjs/common';
import { AdminPermissionsController } from './admin-permissions.controller';
import { AdminPermissionsService } from './admin-permissions.service';
import { AdminPermissionsRepository } from './admin-permissions.repo';

@Module({
  controllers: [AdminPermissionsController],
  providers: [AdminPermissionsService, AdminPermissionsRepository],
  exports: [AdminPermissionsService, AdminPermissionsRepository],
})
export class AdminPermissionsModule {}
