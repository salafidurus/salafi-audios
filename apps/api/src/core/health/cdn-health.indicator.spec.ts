import { vi, describe, it, expect, beforeEach, afterEach, afterAll } from 'bun:test';
import { Test } from '@nestjs/testing';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { ConfigService } from '../../shared/config/config.service';
import { mockList } from '../../test/mocks/bun.mock';

describe('CDNHealthIndicator', () => {
  let indicator: CDNHealthIndicator;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        CDNHealthIndicator,
        {
          provide: ConfigService,
          useValue: {
            R2_BUCKET_NAME: 'test-bucket',
            R2_ACCOUNT_ID: 'test-account',
            R2_ACCESS_KEY_ID: 'test-key',
            R2_SECRET_ACCESS_KEY: 'test-secret',
          },
        },
      ],
    }).compile();

    indicator = module.get(CDNHealthIndicator);
  });

  it('returns up status when s3.list succeeds', async () => {
    mockList.mockResolvedValueOnce({ contents: [] });

    const result = await indicator.pingCheck('cdn');
    expect(result).toEqual({ cdn: { status: 'up' } });
    expect(mockList).toHaveBeenCalledWith({ maxKeys: 1 });
  });

  it('throws HealthCheckError when s3.list fails', async () => {
    mockList.mockRejectedValueOnce(new Error('S3 Connection Failed'));

    await expect(indicator.pingCheck('cdn')).rejects.toThrow('R2 storage check failed');
  });

  it('throws HealthCheckError on timeout', async () => {
    mockList.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 2000)));

    await expect(indicator.pingCheck('cdn', { timeout: 100 })).rejects.toThrow(
      'R2 storage check failed',
    );
  });
});
