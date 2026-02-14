import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SeriesService } from './series.service';
import { SeriesRepository } from './series.repo';
import { SeriesViewDto } from './dto/series-view.dto';
import { UpsertSeriesDto } from './dto/upsert-series.dto';
import { Status } from '@sd/db';

describe('SeriesService', () => {
  let service: SeriesService;
  let repo: jest.Mocked<SeriesRepository>;

  const sample: SeriesViewDto = {
    id: 'sr1',
    scholarId: 'sc1',
    slug: 'series-1',
    title: 'Series 1',
    status: Status.published,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: SeriesRepository,
          useValue: {
            listPublishedByScholarSlug: jest.fn(),
            findPublishedByScholarSlugAndSlug: jest.fn(),
            upsertByScholarSlug: jest.fn(),
          } satisfies Partial<jest.Mocked<SeriesRepository>>,
        },
      ],
    }).compile();

    service = module.get(SeriesService);
    repo = module.get(SeriesRepository) as jest.Mocked<SeriesRepository>;
  });

  it('getPublished throws NotFoundException when missing', async () => {
    repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(null);
    await expect(service.getPublished('sch', 'missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert throws NotFoundException when parent missing', async () => {
    const dto: UpsertSeriesDto = { slug: 's', title: 't' };
    repo.upsertByScholarSlug.mockResolvedValue(null);
    await expect(service.upsert('missing-scholar', dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('upsert returns DTO from repo', async () => {
    const dto: UpsertSeriesDto = {
      slug: 'series-1',
      title: 'Series 1',
      status: Status.published,
    };
    repo.upsertByScholarSlug.mockResolvedValue(sample);

    await expect(service.upsert('sch', dto)).resolves.toEqual(sample);
    expect(repo.upsertByScholarSlug).toHaveBeenCalledWith('sch', dto);
  });
});
