import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdminDashboardDto } from '@sd/core-contracts';

import { CurrentUser } from '../auth/decorators';
import type { AccessGrantAttribute } from '../auth/ability/ability.types';
import { AdminDashboardService } from './admin-dashboard.service';

/** NestJS admin dashboard controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Admin Dashboard')
@Controller('admin/dashboard')
/** Core API admin dashboard.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AdminDashboardController {
  constructor(private readonly service: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get capability-filtered admin dashboard data' })
  getDashboard(
    @CurrentUser()
    // oxlint-disable-next-line anti-slop/require-tsdoc -- Inline structural field is covered by the enclosing API method contract.
    user: { id: string; roles: string[]; accessGrants?: AccessGrantAttribute[] },
  ): Promise<AdminDashboardDto> {
    return this.service.getDashboard(user);
  }
}
