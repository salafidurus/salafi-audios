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

  const sampleList: SeriesViewDto[] = [
    sample,
    {
      id: 'sr2',
      scholarId: 'sc1',
      slug: 'series-2',
      title: 'Series 2',
      status: Status.published,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeriesService,
        {
          provide: SeriesRepository,
          useValue: {
            listPublishedByScholarSlug: jest.fn(),
            findPublishedByScholarSlugAndSlug: jest.fn(),
            findPublishedById: jest.fn(),
            upsertByScholarSlug: jest.fn(),
            listPublishedByScholarAndCollectionSlug: jest.fn(),
          } satisfies Partial<jest.Mocked<SeriesRepository>>,
        },
      ],
    }).compile();

    service = module.get(SeriesService);
    repo = module.get(SeriesRepository) as jest.Mocked<SeriesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listPublished', () => {
    it('returns list of published series for scholar', async () => {
      repo.listPublishedByScholarSlug.mockResolvedValue(sampleList);

      const result = await service.listPublished('scholar-slug');

      expect(repo.listPublishedByScholarSlug).toHaveBeenCalledWith(
        'scholar-slug',
      );
      expect(result).toEqual(sampleList);
    });

    it('returns empty array when no series', async () => {
      repo.listPublishedByScholarSlug.mockResolvedValue([]);

      const result = await service.listPublished('scholar-slug');

      expect(result).toEqual([]);
    });

    it('propagates repository errors', async () => {
      repo.listPublishedByScholarSlug.mockRejectedValue(new Error('DB error'));

      await expect(service.listPublished('scholar-slug')).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('getPublished', () => {
    it('returns series when found', async () => {
      repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(sample);

      const result = await service.getPublished('scholar', 'series-1');

      expect(repo.findPublishedByScholarSlugAndSlug).toHaveBeenCalledWith(
        'scholar',
        'series-1',
      );
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when series missing', async () => {
      repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(null);

      await expect(
        service.getPublished('sch', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getPublishedById', () => {
    it('returns series by id when found', async () => {
      repo.findPublishedById.mockResolvedValue(sample);

      const result = await service.getPublishedById('sr1');

      expect(repo.findPublishedById).toHaveBeenCalledWith('sr1');
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when series not found by id', async () => {
      repo.findPublishedById.mockResolvedValue(null);

      await expect(
        service.getPublishedById('invalid-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates repository errors', async () => {
      repo.findPublishedById.mockRejectedValue(new Error('DB failure'));

      await expect(service.getPublishedById('sr1')).rejects.toThrow(
        'DB failure',
      );
    });
  });

  describe('upsert', () => {
    it('creates/updates series and returns DTO', async () => {
      const dto: UpsertSeriesDto = {
        slug: 'series-1',
        title: 'Series 1',
        status: Status.published,
      };
      repo.upsertByScholarSlug.mockResolvedValue(sample);

      const result = await service.upsert('scholar-slug', dto);

      expect(repo.upsertByScholarSlug).toHaveBeenCalledWith(
        'scholar-slug',
        dto,
      );
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when scholar/collection not found', async () => {
      const dto: UpsertSeriesDto = { slug: 's', title: 't' };
      repo.upsertByScholarSlug.mockResolvedValue(null);

      await expect(
        service.upsert('missing-scholar', dto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates repository errors', async () => {
      const dto: UpsertSeriesDto = { slug: 's', title: 't' };
      repo.upsertByScholarSlug.mockRejectedValue(new Error('DB error'));

      await expect(service.upsert('scholar', dto)).rejects.toThrow('DB error');
    });
  });

  describe('listPublishedForCollection', () => {
    it('returns series for collection', async () => {
      repo.listPublishedByScholarAndCollectionSlug.mockResolvedValue(
        sampleList,
      );

      const result = await service.listPublishedForCollection(
        'scholar',
        'collection-slug',
      );

      expect(repo.listPublishedByScholarAndCollectionSlug).toHaveBeenCalledWith(
        'scholar',
        'collection-slug',
      );
      expect(result).toEqual(sampleList);
    });

    it('throws NotFoundException when collection not found', async () => {
      repo.listPublishedByScholarAndCollectionSlug.mockResolvedValue(null);

      await expect(
        service.listPublishedForCollection('scholar', 'missing-collection'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns empty array when collection exists but has no series', async () => {
      repo.listPublishedByScholarAndCollectionSlug.mockResolvedValue([]);

      const result = await service.listPublishedForCollection(
        'scholar',
        'collection',
      );

      expect(result).toEqual([]);
    });

    it('propagates repository errors', async () => {
      repo.listPublishedByScholarAndCollectionSlug.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.listPublishedForCollection('scholar', 'collection'),
      ).rejects.toThrow('DB error');
    });
  });
});
