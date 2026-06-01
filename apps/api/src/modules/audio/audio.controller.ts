import { Controller, Get, Post, Put, Param, Query, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser, Public } from '../auth/decorators';
import type {
  AudioProgressDto,
  ProgressSyncDto,
  StreamResponseDto,
} from '@sd/core-contracts';
import { AudioService } from './audio.service';

@ApiTags('Audio')
@ApiCommonErrors()
@Controller('audio')
export class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get all or delta progress entries for user' })
  @ApiOkResponse({ description: 'User progress entries' })
  getProgress(
    @CurrentUser() user: { id: string },
    @Query('since') since?: string,
  ): Promise<AudioProgressDto[]> {
    return this.audio.getUserProgress(user.id, since);
  }

  @Post('progress/sync')
  @ApiOperation({ summary: 'Bulk sync progress from client' })
  @ApiOkResponse({ description: 'Progress synced' })
  syncProgress(
    @CurrentUser() user: { id: string },
    @Body() body: ProgressSyncDto,
  ): Promise<void> {
    return this.audio.bulkSync(user.id, body.items ?? []);
  }

  @Put('progress/:lectureId')
  @ApiOperation({ summary: 'Update lecture progress' })
  @ApiOkResponse({ description: 'Progress updated' })
  upsertProgress(
    @CurrentUser() user: { id: string },
    @Param('lectureId') lectureId: string,
    @Body()
    body: {
      positionSeconds: number;
      durationSeconds?: number;
      isCompleted?: boolean;
    },
  ): Promise<void> {
    return this.audio.upsertProgress(
      user.id,
      lectureId,
      body.positionSeconds,
      body.durationSeconds,
      body.isCompleted,
    );
  }

  @Public()
  @Get('lectures/:lectureId/stream')
  @ApiOperation({ summary: 'Resolve a lecture primary audio stream' })
  @ApiOkResponse({ description: 'Primary audio asset URL and duration' })
  getLectureStream(
    @Param('lectureId') lectureId: string,
  ): Promise<StreamResponseDto> {
    return this.audio.resolveStreamUrl(lectureId);
  }
}
