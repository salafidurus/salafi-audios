import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdminDashboardDto } from '@sd/core-contracts';

import { CurrentUser } from '../auth/decorators';
import type { AccessGrantAttribute } from '../auth/ability/ability.types';
import { AdminDashboardService } from './admin-dashboard.service';

@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get capability-filtered admin dashboard data' })
  getDashboard(
    @CurrentUser()
    user: { id: string; roles: string[]; accessGrants?: AccessGrantAttribute[] },
  ): Promise<AdminDashboardDto> {
    return this.service.getDashboard(user);
  }
}
