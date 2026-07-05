import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '../../shared/config/config.service';

@Injectable()
export class CDNHealthIndicator extends HealthIndicator {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.bucket = config.R2_BUCKET_NAME;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async pingCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
    const timeout = options?.timeout ?? 1000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }), {
        abortSignal: controller.signal,
      });

      return this.getStatus(key, true);
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new HealthCheckError('R2 storage check failed', result);
    } finally {
      clearTimeout(timer);
    }
  }
}
