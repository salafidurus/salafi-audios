import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Test } from '@nestjs/testing';
import { CDNHealthIndicator } from './cdn-health.indicator';
import { ConfigService } from '../../shared/config/config.service';

// Mock AWS SDK
const mockSend = vi.fn();
vi.mock('@aws-sdk/client-s3', () => {
  class MockS3Client {
    send = mockSend;
  }
  class MockHeadBucketCommand {
    constructor(public input: any) {}
  }
  return {
    S3Client: MockS3Client,
    HeadBucketCommand: MockHeadBucketCommand,
  };
});

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

  it('returns up status when head command succeeds', async () => {
    mockSend.mockResolvedValueOnce({});

    const result = await indicator.pingCheck('cdn');
    expect(result).toEqual({ cdn: { status: 'up' } });
  });

  it('throws HealthCheckError when head command fails', async () => {
    mockSend.mockRejectedValueOnce(new Error('S3 Connection Failed'));

    await expect(indicator.pingCheck('cdn')).rejects.toThrow('R2 storage check failed');
  });
});
