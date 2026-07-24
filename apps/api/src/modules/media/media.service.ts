import { Injectable } from '@nestjs/common';
import { S3Client } from 'bun';
import { createId } from '@paralleldrive/cuid2';
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from '@sd/core-contracts';
import { ConfigService } from '../../core/config/config.service';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly publicBaseUrl: string;

  constructor(config: ConfigService) {
    this.publicBaseUrl = config.R2_PUBLIC_BASE_URL;
    this.s3 = new S3Client({
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      bucket: config.R2_BUCKET_NAME,
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    });
  }

  async getPresignedUploadUrl(dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    let objectKey: string;

    // Slug-based naming for scholar images: /images/scholars/{slug}.{ext}
    if (dto.slug && dto.purpose === 'image') {
      const ext = dto.filename.split('.').pop()?.toLowerCase() || '';

      // Validate file extension for scholar images
      if (!['png', 'jpg', 'jpeg'].includes(ext)) {
        throw new Error('Scholar images must be png, jpg, or jpeg');
      }

      objectKey = `images/scholars/${dto.slug}.${ext}`;
    } else {
      // Default naming: {purpose}/{cuid}-{filename}
      objectKey = `${dto.purpose}/${createId()}-${dto.filename}`;
    }

    const file = this.s3.file(objectKey);
    const uploadUrl = file.presign({
      method: 'PUT',
      expiresIn: 300,
      type: dto.contentType,
    });
    const publicUrl = `${this.publicBaseUrl}/${objectKey}`;
    return { uploadUrl, publicUrl, objectKey };
  }
}
