import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PermissionsController } from './permissions.controller';
import { AdminUsersController } from './admin-users.controller';
import { PermissionsService } from './permissions.service';
import { PermissionsRepository } from './permissions.repository';
import { AccessService } from './access.service';

@Module({
  imports: [DbModule],
  controllers: [AccountController, PermissionsController, AdminUsersController],
  providers: [AccountService, PermissionsService, PermissionsRepository, AccessService],
  exports: [PermissionsService],
})
export class AccountModule {}
