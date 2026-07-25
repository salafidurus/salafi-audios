import { BadRequestException, Injectable } from '@nestjs/common';
import { S3Client } from 'bun';
import { createId } from '@paralleldrive/cuid2';
import type {
  BatchPresignAudioFile,
  BatchPresignAudioRequestDto,
  BatchPresignAudioResponseDto,
  PresignedUrlRequestDto,
  PresignedUrlResponseDto,
} from '@sd/core-contracts';
import { ConfigService } from '../../core/config/config.service';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'aac', 'ogg', 'opus', 'wav'];

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly publicBaseUrl: string;
  private readonly presignExpiresSeconds: number;

  constructor(config: ConfigService) {
    this.publicBaseUrl = config.R2_PUBLIC_BASE_URL;
    this.presignExpiresSeconds = config.R2_PRESIGN_EXPIRES_SECONDS;
    this.s3 = new S3Client({
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      bucket: config.R2_BUCKET_NAME,
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    });
  }

  async getPresignedUploadUrl(dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    let objectKey: string;

    // Slug-based naming for entity images: /images/{entityType}/{slug}.{ext}
    if (dto.slug && dto.purpose === 'image') {
      const ext = dto.filename.split('.').pop()?.toLowerCase() || '';

      // Validate file extension for images
      if (!['png', 'jpg', 'jpeg'].includes(ext)) {
        throw new Error('Images must be png, jpg, or jpeg');
      }

      const entityType = dto.entityType ?? 'scholar';
      objectKey = `images/${entityType}/${dto.slug}.${ext}`;
    } else {
      // Default naming: {purpose}/{cuid}-{filename}
      objectKey = `${dto.purpose}/${createId()}-${dto.filename}`;
    }

    return { ...this.presignPut(objectKey, dto.contentType), objectKey };
  }

  // Audio keys are slug-derived (audio/{rootSlug}/{slug}.{ext}) so re-uploading a
  // lesson's audio with the same extension overwrites in place; a different
  // extension orphans the old object (cleanup is future work).
  async getBatchAudioPresignedUrls(
    dto: BatchPresignAudioRequestDto,
  ): Promise<BatchPresignAudioResponseDto> {
    if (!SLUG_PATTERN.test(dto.rootSlug)) {
      throw new BadRequestException(`Invalid root slug: ${dto.rootSlug}`);
    }

    const files = dto.files.map((file: BatchPresignAudioFile) => {
      if (!SLUG_PATTERN.test(file.slug)) {
        throw new BadRequestException(`Invalid slug: ${file.slug}`);
      }
      if (file.slug !== dto.rootSlug && !file.slug.startsWith(`${dto.rootSlug}-`)) {
        throw new BadRequestException(`Slug ${file.slug} must be prefixed by ${dto.rootSlug}`);
      }
      const ext = file.filename.split('.').pop()?.toLowerCase() || '';
      if (!AUDIO_EXTENSIONS.includes(ext)) {
        throw new BadRequestException(`Audio files must be one of: ${AUDIO_EXTENSIONS.join(', ')}`);
      }

      const objectKey = `audio/${dto.rootSlug}/${file.slug}.${ext}`;
      return {
        clientId: file.clientId,
        ...this.presignPut(objectKey, file.contentType),
        objectKey,
      };
    });

    return { files, expiresInSeconds: this.presignExpiresSeconds };
  }

  private presignPut(objectKey: string, contentType: string) {
    const uploadUrl = this.s3.file(objectKey).presign({
      method: 'PUT',
      expiresIn: this.presignExpiresSeconds,
      type: contentType,
    });
    return { uploadUrl, publicUrl: `${this.publicBaseUrl}/${objectKey}` };
  }
}
