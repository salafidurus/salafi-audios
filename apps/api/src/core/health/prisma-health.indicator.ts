import { PrismaService } from '@/shared/db/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async pingCheck(
    key: string,
    options?: { timeout?: number },
  ): Promise<HealthIndicatorResult> {
    try {
      const timeout = options?.timeout ?? 1000;
      await Promise.race([
        this.prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeout),
        ),
      ]);
      return this.getStatus(key, true);
    } catch {
      const result = this.getStatus(key, false);
      throw new HealthCheckError('Database check failed', result);
    }
  }
}
