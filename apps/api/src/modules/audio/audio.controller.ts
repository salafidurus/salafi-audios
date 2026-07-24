import { Controller, Get, Post, Put, Param, Query, Body, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser, Public } from '../../core/auth/decorators';
import type { AudioProgressDto, ProgressSyncDto, StreamResponseDto } from '@sd/core-contracts';
import { AudioService } from './audio.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

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
  syncProgress(@CurrentUser() user: { id: string }, @Body() body: ProgressSyncDto): Promise<void> {
    return this.audio.bulkSync(user.id, body.items ?? []);
  }

  @Put('progress/:listingId')
  @ApiOperation({ summary: 'Update listing progress' })
  @ApiOkResponse({ description: 'Progress updated' })
  upsertProgress(
    @CurrentUser() user: { id: string },
    @Param('listingId') listingId: string,
    @Body()
    body: {
      positionSeconds: number;
      durationSeconds?: number;
      isCompleted?: boolean;
    },
  ): Promise<void> {
    return this.audio.upsertProgress(
      user.id,
      listingId,
      body.positionSeconds,
      body.durationSeconds,
      body.isCompleted,
    );
  }

  @Public()
  @Get('listings/:listingId/stream')
  @UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
  @CacheTTL(1 * 60 * 1000) // 1 minute cache
  @ApiOperation({ summary: 'Resolve a listing primary audio stream' })
  @ApiOkResponse({ description: 'Primary audio asset URL and duration' })
  getListingStream(@Param('listingId') listingId: string): Promise<StreamResponseDto> {
    return this.audio.resolveStreamUrl(listingId);
  }
}
