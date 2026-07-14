import { Controller, Patch, Param, Body, Post, Put, Get, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { LivestreamChannelDto, LiveSessionPublicDto } from '@sd/core-contracts';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { LiveService } from './live.service';
import { CreateLivestreamChannelDto } from './dto/create-livestream-channel.dto';
import { UpdateLivestreamChannelDto } from './dto/update-livestream-channel.dto';
import { CreateLiveSessionDto } from './dto/create-live-session.dto';
import { UpdateLiveSessionDto } from './dto/update-live-session.dto';

@ApiTags('Admin Live')
@ApiCommonErrors()
@Controller('admin/live')
export class AdminLiveController {
  constructor(private readonly service: LiveService) {}

  @Get('channels')
  @RequiresPermission(Permissions.LIVE_VIEW)
  @ApiOperation({ summary: 'List all livestream channels' })
  listChannels(): Promise<LivestreamChannelDto[]> {
    return this.service.listChannels();
  }

  @Post('channels')
  @RequiresPermission(Permissions.LIVE_CREATE)
  @ApiOperation({ summary: 'Create a new livestream channel' })
  createChannel(@Body() body: CreateLivestreamChannelDto) {
    return this.service.createChannel(body);
  }

  @Put('channels/:id')
  @RequiresPermission(Permissions.LIVE_EDIT)
  @ApiOperation({ summary: 'Update a livestream channel' })
  updateChannel(@Param('id') id: string, @Body() body: UpdateLivestreamChannelDto) {
    return this.service.updateChannel(id, body);
  }

  @Post('sessions')
  @RequiresPermission(Permissions.LIVE_CREATE)
  @ApiOperation({ summary: 'Create a new live session' })
  createSession(@Body() body: CreateLiveSessionDto) {
    return this.service.createSession(body);
  }

  @Put('sessions/:id')
  @RequiresPermission(Permissions.LIVE_EDIT)
  @ApiOperation({ summary: 'Update a live session' })
  updateSession(@Param('id') id: string, @Body() body: UpdateLiveSessionDto) {
    return this.service.updateSession(id, body);
  }

  @Patch('sessions/:id/go-live')
  @RequiresPermission(Permissions.LIVE_START)
  @ApiOperation({ summary: 'Go live — transition session to live status' })
  goLive(@Param('id') id: string): Promise<unknown> {
    return this.service.updateSessionStatus(id, 'live');
  }

  @Patch('sessions/:id/end')
  @RequiresPermission(Permissions.LIVE_STOP)
  @ApiOperation({ summary: 'End live session — transition to ended status' })
  endSession(@Param('id') id: string): Promise<unknown> {
    return this.service.updateSessionStatus(id, 'ended');
  }

  @Patch('sessions/:id/reschedule')
  @RequiresPermission(Permissions.LIVE_EDIT)
  @ApiOperation({ summary: 'Reschedule — transition session back to scheduled' })
  rescheduleSession(@Param('id') id: string): Promise<unknown> {
    return this.service.updateSessionStatus(id, 'scheduled');
  }

  @Get('sessions')
  @RequiresPermission(Permissions.LIVE_VIEW)
  @ApiOperation({ summary: 'List all livestream sessions for admin' })
  listSessions(): Promise<LiveSessionPublicDto[]> {
    return this.service.listAdminSessions();
  }

  @Delete('sessions/:id')
  @RequiresPermission(Permissions.LIVE_DELETE)
  @ApiOperation({ summary: 'Delete a live session' })
  async deleteSession(@Param('id') id: string): Promise<void> {
    await this.service.deleteSession(id);
  }

  @Delete('channels/:id')
  @RequiresPermission(Permissions.LIVE_DELETE)
  @ApiOperation({ summary: 'Delete a livestream channel' })
  async deleteChannel(@Param('id') id: string): Promise<void> {
    await this.service.deleteChannel(id);
  }
}
