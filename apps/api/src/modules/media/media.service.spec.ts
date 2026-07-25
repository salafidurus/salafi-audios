import { vi, describe, it, expect, beforeEach } from 'bun:test';
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MediaService } from './media.service';
import { ConfigService } from '../../core/config/config.service';

vi.mock('@paralleldrive/cuid2', () => ({
  createId: () => 'mock-cuid-12345',
}));

describe('MediaService', () => {
  let service: MediaService;
  let mockPresign: ReturnType<typeof vi.fn>;

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
            R2_PRESIGN_EXPIRES_SECONDS: 3600,
          },
        },
      ],
    }).compile();

    service = module.get(MediaService);
    mockPresign = vi.fn().mockImplementation(() => 'https://mock-s3-upload-url.com/signed');
    (service as any).s3.file = vi.fn().mockReturnValue({ presign: mockPresign });
  });

  it('generates an objectKey with the purpose prefix and presigned url', async () => {
    const result = await service.getPresignedUploadUrl({
      filename: 'lecture.mp3',
      contentType: 'audio/mpeg',
      purpose: 'audio',
    });

    expect(result.objectKey).toBe('audio/mock-cuid-12345-lecture.mp3');
    expect(result.publicUrl).toBe('https://cdn.example.com/audio/mock-cuid-12345-lecture.mp3');
    expect(result.uploadUrl).toBe('https://mock-s3-upload-url.com/signed');
    expect(mockPresign).toHaveBeenCalledWith({
      method: 'PUT',
      expiresIn: 3600,
      type: 'audio/mpeg',
    });
  });

  describe('getBatchAudioPresignedUrls', () => {
    it('builds slug-derived keys under the root folder', async () => {
      const result = await service.getBatchAudioPresignedUrls({
        rootSlug: 'ajurumiyyah',
        files: [
          {
            clientId: 'c1',
            filename: '001 Kalam.mp3',
            contentType: 'audio/mpeg',
            slug: 'ajurumiyyah-kalam',
          },
          {
            clientId: 'c2',
            filename: 'root.m4a',
            contentType: 'audio/mp4',
            slug: 'ajurumiyyah',
          },
        ],
      });

      expect(result.files).toEqual([
        {
          clientId: 'c1',
          uploadUrl: 'https://mock-s3-upload-url.com/signed',
          publicUrl: 'https://cdn.example.com/audio/ajurumiyyah/ajurumiyyah-kalam.mp3',
          objectKey: 'audio/ajurumiyyah/ajurumiyyah-kalam.mp3',
        },
        {
          clientId: 'c2',
          uploadUrl: 'https://mock-s3-upload-url.com/signed',
          publicUrl: 'https://cdn.example.com/audio/ajurumiyyah/ajurumiyyah.m4a',
          objectKey: 'audio/ajurumiyyah/ajurumiyyah.m4a',
        },
      ]);
      expect(result.expiresInSeconds).toBe(3600);
    });

    it('rejects slugs not prefixed by the root slug', async () => {
      await expect(
        service.getBatchAudioPresignedUrls({
          rootSlug: 'ajurumiyyah',
          files: [
            { clientId: 'c1', filename: 'a.mp3', contentType: 'audio/mpeg', slug: 'bukhari-ilm' },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects invalid slug charset', async () => {
      await expect(
        service.getBatchAudioPresignedUrls({
          rootSlug: 'ajurumiyyah',
          files: [
            {
              clientId: 'c1',
              filename: 'a.mp3',
              contentType: 'audio/mpeg',
              slug: 'ajurumiyyah-Kalam!',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects non-audio extensions', async () => {
      await expect(
        service.getBatchAudioPresignedUrls({
          rootSlug: 'ajurumiyyah',
          files: [
            {
              clientId: 'c1',
              filename: 'notes.pdf',
              contentType: 'application/pdf',
              slug: 'ajurumiyyah-kalam',
            },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
