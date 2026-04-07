import { Controller, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { LiveSessionStatus } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LiveService } from './live.service';

@ApiTags('Admin Live')
@ApiCommonErrors()
@Controller('admin/live')
@UseGuards(AdminPermissionGuard)
export class AdminLiveController {
  constructor(private readonly service: LiveService) {}

  @Patch('sessions/:id/status')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'Update a live session status' })
  updateSessionStatus(
    @Param('id') id: string,
    @Body() body: { status: LiveSessionStatus },
  ) {
    return this.service.updateSessionStatus(id, body.status);
  }
}
