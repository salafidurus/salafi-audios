import { Controller, Patch, Param, Body, UseGuards, Post, Put, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type {
  LiveSessionStatus,
  CreateLivestreamChannelDto,
  UpdateLivestreamChannelDto,
  CreateLiveSessionDto,
  UpdateLiveSessionDto,
  LivestreamChannelDto,
} from '@sd/core-contracts';
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

  @Get('channels')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'List all livestream channels' })
  listChannels(): Promise<LivestreamChannelDto[]> {
    return this.service.listChannels();
  }

  @Post('channels')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'Create a new livestream channel' })
  createChannel(@Body() body: CreateLivestreamChannelDto) {
    return this.service.createChannel(body);
  }

  @Put('channels/:id')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'Update a livestream channel' })
  updateChannel(@Param('id') id: string, @Body() body: UpdateLivestreamChannelDto) {
    return this.service.updateChannel(id, body);
  }

  @Post('sessions')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'Create a new live session' })
  createSession(@Body() body: CreateLiveSessionDto) {
    return this.service.createSession(body);
  }

  @Put('sessions/:id')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'Update a live session' })
  updateSession(@Param('id') id: string, @Body() body: UpdateLiveSessionDto) {
    return this.service.updateSession(id, body);
  }

  @Patch('sessions/:id/status')
  @RequiresPermission('manage:livestreams')
  @ApiOperation({ summary: 'Update a live session status' })
  updateSessionStatus(@Param('id') id: string, @Body() body: { status: LiveSessionStatus }) {
    return this.service.updateSessionStatus(id, body.status);
  }
}
