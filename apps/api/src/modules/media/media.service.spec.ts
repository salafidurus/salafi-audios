import { Test } from '@nestjs/testing';
import { MediaService } from './media.service';
import { ConfigService } from '../../shared/config/config.module';

describe('MediaService', () => {
  let service: MediaService;

  beforeEach(async () => {
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

  it('generates an objectKey with the purpose prefix', async () => {
    const result = await service.getPresignedUploadUrl({
      filename: 'lecture.mp3',
      contentType: 'audio/mpeg',
      purpose: 'audio',
    });

    expect(result.objectKey).toMatch(/^audio\//);
    expect(result.publicUrl).toContain('lecture.mp3');
    expect(result.uploadUrl).toBeTruthy();
  });
});
