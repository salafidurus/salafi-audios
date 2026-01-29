import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AudioAssetsService } from './audio-assets.service';
import { AudioAssetsRepository } from './audio-assets.repo';
import { AudioAssetViewDto } from './dto/audio-asset-view.dto';
import { UpsertAudioAssetDto } from './dto/upsert-audio-asset.dto';

describe('AudioAssetsService', () => {
  let service: AudioAssetsService;
  let repo: jest.Mocked<AudioAssetsRepository>;

  const sample: AudioAssetViewDto = {
    id: 'aa1',
    lectureId: 'l1',
    url: 'https://cdn.example.com/a.mp3',
    isPrimary: true,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioAssetsService,
        {
          provide: AudioAssetsRepository,
          useValue: {
            listByLectureId: jest.fn(),
            findById: jest.fn(),
            upsertByLectureIdAndUrl: jest.fn(),
          } satisfies Partial<jest.Mocked<AudioAssetsRepository>>,
        },
      ],
    }).compile();

    service = module.get(AudioAssetsService);
    repo = module.get(
      AudioAssetsRepository,
    ) as jest.Mocked<AudioAssetsRepository>;
  });

  it('listByLectureId throws NotFoundException if lecture missing', async () => {
    repo.listByLectureId.mockResolvedValue(null);
    await expect(service.listByLectureId('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('getById throws NotFoundException if missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsertByLecture throws NotFoundException if lecture missing', async () => {
    const dto: UpsertAudioAssetDto = { url: 'x' };
    repo.upsertByLectureIdAndUrl.mockResolvedValue(null);
    await expect(
      service.upsertByLecture('missing', dto),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upsertByLecture returns DTO from repo', async () => {
    const dto: UpsertAudioAssetDto = { url: sample.url, isPrimary: true };
    repo.upsertByLectureIdAndUrl.mockResolvedValue(sample);

    await expect(service.upsertByLecture('l1', dto)).resolves.toEqual(sample);
  });
});
