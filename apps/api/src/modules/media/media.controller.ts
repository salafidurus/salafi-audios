import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { MediaService } from './media.service';

@ApiTags('Admin Media')
@ApiCommonErrors()
@Controller('admin/media')
@UseGuards(AdminPermissionGuard)
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Post('presigned-url')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Get a presigned R2 upload URL' })
  getPresignedUrl(@Body() dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    return this.service.getPresignedUploadUrl(dto);
  }
}
