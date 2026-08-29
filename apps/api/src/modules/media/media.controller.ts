import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type {
  BatchPresignAudioResponseDto,
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { BatchPresignAudioRequestDto } from './dto/batch-presign.dto';
import { MediaService } from './media.service';
import { RateLimitPolicy } from '../../core/security/rate-limit.decorator';

// Presign requests aren't correlated to a specific scholar/listing at this
// step, so this stays an unconditioned check — anyone with ANY upload
// capability (global or scholar-scoped) passes. Candidate for scholar-scoping
// via listing reference in a future project; out of scope here.
/** NestJS media controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Admin Media')
@ApiCommonErrors()
@Controller('admin/media')
/** media application module responsible for media.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('presigned-url')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Media')
  @ApiOperation({ summary: 'Get a presigned R2 upload URL' })
  getPresignedUrl(@Body() dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    return this.service.getPresignedUploadUrl(dto);
  }

  @Post('presign-batch')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('write', 'Media')
  @ApiOperation({ summary: 'Get presigned R2 upload URLs for a batch of audio files' })
  presignBatch(@Body() dto: BatchPresignAudioRequestDto): Promise<BatchPresignAudioResponseDto> {
    return this.service.getBatchAudioPresignedUrls(dto);
  }
}
