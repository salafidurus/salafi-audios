import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CollectionService } from './collections.service';
import { CollectionRepository } from './collections.repo';
import { UpsertCollectionDto } from './dto/upsert-collection.dto';
import { CollectionViewDto } from './dto/collection-view.dto';
import { Status } from '@sd/db';

describe('CollectionService', () => {
  let service: CollectionService;
  let repo: jest.Mocked<CollectionRepository>;

  const sample: CollectionViewDto = {
    id: 'c1',
    scholarId: 's1',
    slug: 'col-1',
    title: 'Collection 1',
    status: Status.published,
    createdAt: new Date().toISOString(),
  };

  const sampleList: CollectionViewDto[] = [
    sample,
    {
      id: 'c2',
      scholarId: 's1',
      slug: 'col-2',
      title: 'Collection 2',
      status: Status.published,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: CollectionRepository,
          useValue: {
            listPublishedByScholarSlug: jest.fn(),
            findPublishedByScholarSlugAndSlug: jest.fn(),
            findPublishedById: jest.fn(),
            upsertByScholarSlug: jest.fn(),
          } satisfies Partial<jest.Mocked<CollectionRepository>>,
        },
      ],
    }).compile();

    service = module.get(CollectionService);
    repo = module.get(
      CollectionRepository,
    ) as jest.Mocked<CollectionRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listPublished', () => {
    it('returns list of published collections for scholar', async () => {
      repo.listPublishedByScholarSlug.mockResolvedValue(sampleList);

      const result = await service.listPublished('scholar-slug');

      expect(repo.listPublishedByScholarSlug).toHaveBeenCalledWith(
        'scholar-slug',
      );
      expect(result).toEqual(sampleList);
    });

    it('returns empty array when no collections', async () => {
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
    it('returns collection when found', async () => {
      repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(sample);

      const result = await service.getPublished('scholar', 'col-1');

      expect(repo.findPublishedByScholarSlugAndSlug).toHaveBeenCalledWith(
        'scholar',
        'col-1',
      );
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when collection missing', async () => {
      repo.findPublishedByScholarSlugAndSlug.mockResolvedValue(null);

      await expect(
        service.getPublished('sch', 'missing'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('getPublishedById', () => {
    it('returns collection by id when found', async () => {
      repo.findPublishedById.mockResolvedValue(sample);

      const result = await service.getPublishedById('c1');

      expect(repo.findPublishedById).toHaveBeenCalledWith('c1');
      expect(result).toEqual(sample);
    });

    it('throws NotFoundException when collection not found by id', async () => {
      repo.findPublishedById.mockResolvedValue(null);

      await expect(
        service.getPublishedById('invalid-id'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates repository errors', async () => {
      repo.findPublishedById.mockRejectedValue(new Error('DB failure'));

      await expect(service.getPublishedById('c1')).rejects.toThrow(
        'DB failure',
      );
    });
  });

  describe('upsert', () => {
    it('creates/updates collection and returns DTO', async () => {
      const dto: UpsertCollectionDto = {
        slug: 'col-1',
        title: 'Collection 1',
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
      const dto: UpsertCollectionDto = { slug: 'c', title: 't' };
      repo.upsertByScholarSlug.mockResolvedValue(null);

      await expect(
        service.upsert('missing-scholar', dto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('propagates repository errors', async () => {
      const dto: UpsertCollectionDto = { slug: 'c', title: 't' };
      repo.upsertByScholarSlug.mockRejectedValue(new Error('DB error'));

      await expect(service.upsert('scholar', dto)).rejects.toThrow('DB error');
    });
  });
});
