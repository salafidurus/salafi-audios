import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Test } from '@nestjs/testing';
import { MediaService } from './media.service';
import { ConfigService } from '../../shared/config/config.module';

vi.mock('@paralleldrive/cuid2', () => ({
  createId: () => 'mock-cuid-12345',
}));

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: ConfigService,
          useValue: {
            R2_ACCOUNT_ID: 'test-account',
            R2_ACCESS_KEY_ID: 'test-key',
            R2_SECRET_ACCESS_KEY: 'test-secret',
            R2_BUCKET_NAME: 'test-bucket',
            R2_PUBLIC_BASE_URL: 'https://cdn.example.com',
          },
        },
      ],
    }).compile();

    service = module.get(MediaService);
  });

  it('generates an objectKey with the purpose prefix and presigned url', async () => {
    // Mock the S3Client's file and presign methods
    const mockPresign = vi
      .fn()
      .mockReturnValueOnce('https://mock-s3-upload-url.com/audio/mock-cuid-12345-lecture.mp3');

    (service as any).s3.file = vi.fn().mockReturnValue({
      presign: mockPresign,
    });

    const result = await service.getPresignedUploadUrl({
      filename: 'lecture.mp3',
      contentType: 'audio/mpeg',
      purpose: 'audio',
    });

    expect(result.objectKey).toBe('audio/mock-cuid-12345-lecture.mp3');
    expect(result.publicUrl).toBe('https://cdn.example.com/audio/mock-cuid-12345-lecture.mp3');
    expect(result.uploadUrl).toBe(
      'https://mock-s3-upload-url.com/audio/mock-cuid-12345-lecture.mp3',
    );
    expect(mockPresign).toHaveBeenCalledWith({
      method: 'PUT',
      expiresIn: 300,
      type: 'audio/mpeg',
    });
  });
});
