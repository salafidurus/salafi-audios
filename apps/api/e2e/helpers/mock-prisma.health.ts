import { HealthIndicator } from '@nestjs/terminus';
import type { HealthIndicatorResult } from '@nestjs/terminus';

export class MockPrismaHealthIndicator extends HealthIndicator {
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    return this.getStatus(key, true, { currentState: 'idle' });
  }
}
