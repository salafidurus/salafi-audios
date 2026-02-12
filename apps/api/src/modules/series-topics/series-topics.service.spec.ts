import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SeriesTopicsService } from './series-topics.service';
import { SeriesTopicsRepository } from './series-topics.repo';
import { LectureTopicViewDto } from '../lecture-topics/dto/lecture-topic-view.dto';

describe('SeriesTopicsService', () => {
  let service: SeriesTopicsService;
  let repo: jest.Mocked<SeriesTopicsRepository>;

  const sample: LectureTopicViewDto = {
    topic: { id: 't1', slug: 'tawheed', name: 'Tawheed' },
    attachedAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesTopicsService,
        {
          provide: SeriesTopicsRepository,
          useValue: {
            listByScholarAndSeriesSlug: jest.fn(),
            attach: jest.fn(),
            detach: jest.fn(),
          } satisfies Partial<jest.Mocked<SeriesTopicsRepository>>,
        },
      ],
    }).compile();

    service = module.get(SeriesTopicsService);
    repo = module.get(
      SeriesTopicsRepository,
    ) as jest.Mocked<SeriesTopicsRepository>;
  });

  it('list throws NotFoundException when repo returns null', async () => {
    repo.listByScholarAndSeriesSlug.mockResolvedValue(null);
    await expect(service.list('s', 'x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('attach returns dto', async () => {
    repo.attach.mockResolvedValue(sample);
    await expect(service.attach('s', 'x', 'tawheed')).resolves.toEqual(sample);
  });

  it('attach throws NotFoundException when repo returns null', async () => {
    repo.attach.mockResolvedValue(null);
    await expect(service.attach('s', 'x', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('detach returns ok:true when repo returns true', async () => {
    repo.detach.mockResolvedValue(true);
    await expect(service.detach('s', 'x', 'tawheed')).resolves.toEqual({
      ok: true,
    });
  });

  it('detach throws NotFoundException when repo returns null', async () => {
    repo.detach.mockResolvedValue(null);
    await expect(service.detach('s', 'x', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
