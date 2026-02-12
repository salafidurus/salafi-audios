import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectionTopicsService } from './collection-topics.service';
import { CollectionTopicsRepository } from './collection-topics.repo';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';

describe('CollectionTopicsService', () => {
  let service: CollectionTopicsService;
  let repo: jest.Mocked<CollectionTopicsRepository>;

  const sample: LectureTopicViewDto = {
    topic: { id: 't1', slug: 'tawheed', name: 'Tawheed' },
    attachedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionTopicsService,
        {
          provide: CollectionTopicsRepository,
          useValue: {
            listByScholarAndCollectionSlug: jest.fn(),
            attach: jest.fn(),
            detach: jest.fn(),
          } satisfies Partial<jest.Mocked<CollectionTopicsRepository>>,
        },
      ],
    }).compile();

    service = module.get(CollectionTopicsService);
    repo = module.get(
      CollectionTopicsRepository,
    ) as jest.Mocked<CollectionTopicsRepository>;
  });

  it('list throws NotFoundException when repo returns null', async () => {
    repo.listByScholarAndCollectionSlug.mockResolvedValue(null);
    await expect(service.list('s', 'c')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('attach returns dto', async () => {
    repo.attach.mockResolvedValue(sample);
    await expect(service.attach('s', 'c', 'tawheed')).resolves.toEqual(sample);
  });

  it('attach throws NotFoundException when repo returns null', async () => {
    repo.attach.mockResolvedValue(null);
    await expect(service.attach('s', 'c', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('detach returns ok:true when repo returns true', async () => {
    repo.detach.mockResolvedValue(true);
    await expect(service.detach('s', 'c', 'tawheed')).resolves.toEqual({
      ok: true,
    });
  });

  it('detach throws NotFoundException when repo returns null', async () => {
    repo.detach.mockResolvedValue(null);
    await expect(service.detach('s', 'c', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
