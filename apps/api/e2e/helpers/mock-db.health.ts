import {
  createHealthIndicatorResult,
  type HealthIndicatorResult,
} from '../../src/core/health/health.service';

export class MockDbHealthIndicator {
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    return createHealthIndicatorResult(key, 'up', { currentState: 'idle' });
  }
}
