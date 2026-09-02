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

/** Core API account.module module providing shared backend infrastructure and authority-boundary services. */
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
/** NestJS account module service or controller coordinating the API boundary for this responsibility. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AccountModule {}
