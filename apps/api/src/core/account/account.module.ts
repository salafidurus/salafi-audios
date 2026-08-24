import { Module } from '@nestjs/common';
import { DbModule } from '../db/db.module';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { AdminUsersController } from './admin-users.controller';
import { UserDirectoryService } from './user-directory.service';
import { UserDirectoryRepository } from './user-directory.repository';
import { AccessService } from './access.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

@Module({
  imports: [DbModule],
  controllers: [AccountController, AdminUsersController, AdminDashboardController],
  providers: [
    AccountService,
    UserDirectoryService,
    UserDirectoryRepository,
    AccessService,
    AdminDashboardService,
  ],
  exports: [UserDirectoryService],
})
export class AccountModule {}
