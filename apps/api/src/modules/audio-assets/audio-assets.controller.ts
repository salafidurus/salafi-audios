import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { AudioAssetsService } from './audio-assets.service';
import { AudioAssetViewDto } from './dto/audio-asset-view.dto';
import { UpsertAudioAssetDto } from './dto/upsert-audio-asset.dto';

@SkipThrottle()
@ApiTags('AudioAssets')
@ApiCommonErrors()
@Controller('lectures/:lectureId/audio-assets')
export class AudioAssetsController {
  constructor(private readonly assets: AudioAssetsService) {}

  @Get()
  @ApiOperation({ summary: 'List audio assets for a lecture' })
  @ApiOkResponse({ type: [AudioAssetViewDto] })
  list(@Param('lectureId') lectureId: string): Promise<AudioAssetViewDto[]> {
    return this.assets.listByLectureId(lectureId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio asset by id' })
  @ApiOkResponse({ type: AudioAssetViewDto })
  getById(@Param('id') id: string): Promise<AudioAssetViewDto> {
    return this.assets.getById(id);
  }

  @Post('upsert')
  @ApiOperation({ summary: 'Upsert audio asset by (lectureId + url)' })
  @ApiOkResponse({ type: AudioAssetViewDto })
  upsert(
    @Param('lectureId') lectureId: string,
    @Body() dto: UpsertAudioAssetDto,
  ): Promise<AudioAssetViewDto> {
    return this.assets.upsertByLecture(lectureId, dto);
  }
}
