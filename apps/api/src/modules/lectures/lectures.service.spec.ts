import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LecturesService } from './lectures.service';
import { LecturesRepository } from './lectures.repo';
import { LectureViewDto } from './dto/lecture-view.dto';
import { UpsertLectureDto } from './dto/upsert-lecture.dto';
import { Status } from '@sd/db';

describe('LecturesService', () => {
  let service: LecturesService;
  let repo: jest.Mocked<LecturesRepository>;

  const sample: LectureViewDto = {
    id: 'l1',
    scholarId: 'sc1',
    slug: 'lecture-1',
    title: 'Lecture 1',
    status: Status.published,
    createdAt: new Date().toISOString(),
  };

  const sampleList: LectureViewDto[] = [
    sample,
    {
      id: 'l2',
      scholarId: 'sc1',
      slug: 'lecture-2',
      title: 'Lecture 2',
      status: Status.published,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturesService,
        {
          provide: LecturesRepository,
          useValue: {
            listPublishedByScholarSlug: jest.fn(),
            findPublishedByScholarSlugAndSlug: jest.fn(),
            findPublishedById: jest.fn(),
            upsertByScholarSlug: jest.fn(),
            listPublishedByScholarAndSeriesSlug: jest.fn(),
          } satisfies Partial<jest.Mocked<LecturesRepository>>,
        },
      ],
    }).compile();

    service = module.get(LecturesService);
    repo = module.get(LecturesRepository) as jest.Mocked<LecturesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listPublished', () => {
    it('returns list of published lectures for scholar', async () => {
      repo.listPublishedByScholarSlug.mockResolvedValue(sampleList);

      const result = await service.listPublished('scholar-slug');

      expect(repo.listPublishedByScholarSlug).toHaveBeenCalledWith(
        'scholar-slug',
      );
      expect(result).toEqual(sampleList);
    });

    it('returns empty array when no lectures', async () => {
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
    it('returns lecture when found', async () => {
      repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(sample);

      const result = await service.getPublished('scholar', 'lecture-1');

      expect(repo.findPublishedByScholarSlugAndSlug).toHaveBeenCalledWith(
        'scholar',
        'lecture-1',
      );
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when lecture missing', async () => {
      repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(null);

      await expect(
        service.getPublished('sch', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getPublishedById', () => {
    it('returns lecture by id when found', async () => {
      repo.findPublishedById.mockResolvedValue(sample);

      const result = await service.getPublishedById('l1');

      expect(repo.findPublishedById).toHaveBeenCalledWith('l1');
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when lecture not found by id', async () => {
      repo.findPublishedById.mockResolvedValue(null);

      await expect(
        service.getPublishedById('invalid-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates repository errors', async () => {
      repo.findPublishedById.mockRejectedValue(new Error('DB failure'));

      await expect(service.getPublishedById('l1')).rejects.toThrow(
        'DB failure',
      );
    });
  });

  describe('upsert', () => {
    it('creates/updates lecture and returns DTO', async () => {
      const dto: UpsertLectureDto = {
        slug: 'lecture-1',
        title: 'Lecture 1',
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

    it('throws NotFoundException when scholar not found', async () => {
      const dto: UpsertLectureDto = { slug: 'l', title: 't' };
      repo.upsertByScholarSlug.mockResolvedValue(null);

      await expect(
        service.upsert('missing-scholar', dto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates repository errors', async () => {
      const dto: UpsertLectureDto = { slug: 'l', title: 't' };
      repo.upsertByScholarSlug.mockRejectedValue(new Error('DB error'));

      await expect(service.upsert('scholar', dto)).rejects.toThrow('DB error');
    });
  });

  describe('listPublishedForSeries', () => {
    it('returns lectures for series', async () => {
      repo.listPublishedByScholarAndSeriesSlug.mockResolvedValue(sampleList);

      const result = await service.listPublishedForSeries(
        'scholar',
        'series-slug',
      );

      expect(repo.listPublishedByScholarAndSeriesSlug).toHaveBeenCalledWith(
        'scholar',
        'series-slug',
      );
      expect(result).toEqual(sampleList);
    });

    it('throws NotFoundException when series not found', async () => {
      repo.listPublishedByScholarAndSeriesSlug.mockResolvedValue(null);

      await expect(
        service.listPublishedForSeries('scholar', 'missing-series'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns empty array when series exists but has no lectures', async () => {
      repo.listPublishedByScholarAndSeriesSlug.mockResolvedValue([]);

      const result = await service.listPublishedForSeries('scholar', 'series');

      expect(result).toEqual([]);
    });

    it('propagates repository errors', async () => {
      repo.listPublishedByScholarAndSeriesSlug.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.listPublishedForSeries('scholar', 'series'),
      ).rejects.toThrow('DB error');
    });
  });
});
