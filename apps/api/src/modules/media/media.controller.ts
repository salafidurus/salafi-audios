import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import type {
  BatchPresignAudioResponseDto,
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../core/auth/decorators';
import { BatchPresignAudioRequestDto } from './dto/batch-presign.dto';
import { MediaService } from './media.service';

@ApiTags('Admin Media')
@ApiCommonErrors()
@Controller('admin/media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('presigned-url')
  @RequiresPermission(Permissions.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Get a presigned R2 upload URL' })
  getPresignedUrl(@Body() dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    return this.service.getPresignedUploadUrl(dto);
  }

  @Post('presign-batch')
  @RequiresPermission(Permissions.MEDIA_UPLOAD)
  @ApiOperation({ summary: 'Get presigned R2 upload URLs for a batch of audio files' })
  presignBatch(@Body() dto: BatchPresignAudioRequestDto): Promise<BatchPresignAudioResponseDto> {
    return this.service.getBatchAudioPresignedUrls(dto);
  }
}
