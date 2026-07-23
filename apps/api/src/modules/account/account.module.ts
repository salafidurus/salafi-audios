import { Module } from '@nestjs/common';
import { DbModule } from '../../shared/db/db.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PermissionsController } from './permissions.controller';
import { AdminUsersController } from './admin-users.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';

@Module({
  imports: [DbModule],
  controllers: [AccountController, PermissionsController, AdminUsersController],
  providers: [AccountService, PermissionsService, PermissionsRepository],
  exports: [PermissionsService],
})
export class AccountModule {}
