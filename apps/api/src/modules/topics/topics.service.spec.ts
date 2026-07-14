import { vi, type Mocked } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TopicDetailDto } from '@sd/core-contracts';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { TopicsRepository } from './topics.repo';
import { TopicsService } from './topics.service';

describe('TopicsService', () => {
  let service: TopicsService;
  let repo: Mocked<TopicsRepository>;

  const sample: TopicDetailDto = {
    id: 't1',
    slug: 'aqeedah',
    name: { en: 'Aqeedah' },
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        {
          provide: TopicsRepository,
          useValue: {
            list: vi.fn(),
            findBySlug: vi.fn(),
            upsertBySlug: vi.fn(),
            upsertTopicTranslation: vi.fn(),
          } satisfies Partial<Mocked<TopicsRepository>>,
        },
      ],
    }).compile();

    service = module.get(TopicsService);
    repo = module.get(TopicsRepository) as Mocked<TopicsRepository>;
  });

  it('getBySlug throws NotFoundException if missing', async () => {
    repo.findBySlug.mockResolvedValue(null);
    await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upsert returns DTO from repo', async () => {
    const dto: UpsertTopicDto = { slug: 'aqeedah', name: { en: 'Aqeedah' } };
    repo.upsertBySlug.mockResolvedValue(sample);
    repo.findBySlug.mockResolvedValue(sample);

    await expect(service.upsert(dto)).resolves.toEqual(sample);
  });
});
