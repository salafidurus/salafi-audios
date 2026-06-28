import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '../../shared/config/config.service';

@Injectable()
export class R2HealthIndicator extends HealthIndicator {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    super();
    this.bucket = config.R2_BUCKET_NAME;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.R2_ACCESS_KEY_ID,
        secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async pingCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
    try {
      const timeout = options?.timeout ?? 1000;
      await Promise.race([
        this.s3.send(new HeadBucketCommand({ Bucket: this.bucket })),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout)),
      ]);
      return this.getStatus(key, true);
    } catch {
      const result = this.getStatus(key, false);
      throw new HealthCheckError('R2 storage check failed', result);
    }
  }
}
