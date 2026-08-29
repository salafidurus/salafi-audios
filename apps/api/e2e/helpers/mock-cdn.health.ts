import { Injectable } from '@nestjs/common';
import {
  createHealthIndicatorResult,
  type HealthIndicatorResult,
} from '../../src/core/health/health.service';

@Injectable()
export class MockCDNHealthIndicator {
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    return createHealthIndicatorResult(key, 'up');
  }
}
