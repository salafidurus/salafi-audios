import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { S3Client } from 'bun';
import { ConfigService } from '../../shared/config/config.service';

@Injectable()
export class CDNHealthIndicator extends HealthIndicator {
  private readonly s3: S3Client;

  constructor(private readonly config: ConfigService) {
    super();
    this.s3 = new S3Client({
      accessKeyId: config.R2_ACCESS_KEY_ID,
      secretAccessKey: config.R2_SECRET_ACCESS_KEY,
      bucket: config.R2_BUCKET_NAME,
      endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    });
  }

  async pingCheck(key: string, options?: { timeout?: number }): Promise<HealthIndicatorResult> {
    const timeout = options?.timeout ?? 1000;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Request timeout')), timeout);
    });

    try {
      await Promise.race([this.s3.list({ maxKeys: 1 }), timeoutPromise]);

      return this.getStatus(key, true);
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new HealthCheckError('R2 storage check failed', result);
    } finally {
      if (timer) {
        clearTimeout(timer);
      }
    }
  }
}
