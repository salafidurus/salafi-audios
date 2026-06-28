import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createId } from '@paralleldrive/cuid2';
import type { PresignedUrlRequestDto, PresignedUrlResponseDto } from '@sd/core-contracts';
import { ConfigService } from '../../shared/config/config.module';

@Injectable()
export class MediaService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.R2_BUCKET_NAME;
    this.publicBaseUrl = config.R2_PUBLIC_BASE_URL;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async getPresignedUploadUrl(dto: PresignedUrlRequestDto): Promise<PresignedUrlResponseDto> {
    const objectKey = `${dto.purpose}/${createId()}-${dto.filename}`;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: dto.contentType,
    });
    const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn: 300 });
    const publicUrl = `${this.publicBaseUrl}/${objectKey}`;
    return { uploadUrl, publicUrl, objectKey };
  }
}
