import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
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
}
