import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TopicDetailDto } from './dto/topic-detail.dto';
import { UpsertTopicDto } from './dto/upsert-topic.dto';
import { TopicsRepository } from './topics.repo';
import { TopicsService } from './topics.service';

describe('TopicsService', () => {
  let service: TopicsService;
  let repo: jest.Mocked<TopicsRepository>;

  const sample: TopicDetailDto = {
    id: 't1',
    slug: 'aqeedah',
    name: 'Aqeedah',
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        {
          provide: TopicsRepository,
          useValue: {
            list: jest.fn(),
            findBySlug: jest.fn(),
            upsertBySlug: jest.fn(),
          } satisfies Partial<jest.Mocked<TopicsRepository>>,
        },
      ],
    }).compile();

    service = module.get(TopicsService);
    repo = module.get(TopicsRepository) as jest.Mocked<TopicsRepository>;
  });

  it('getBySlug throws NotFoundException if missing', async () => {
    repo.findBySlug.mockResolvedValue(null);
    await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert throws NotFoundException when parentSlug is missing', async () => {
    const dto: UpsertTopicDto = {
      slug: 'child',
      name: 'Child',
      parentSlug: 'missing-parent',
    };
    repo.upsertBySlug.mockResolvedValue(null);

    await expect(service.upsert(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upsert returns DTO from repo', async () => {
    const dto: UpsertTopicDto = { slug: 'aqeedah', name: 'Aqeedah' };
    repo.upsertBySlug.mockResolvedValue(sample);

    await expect(service.upsert(dto)).resolves.toEqual(sample);
  });
});
