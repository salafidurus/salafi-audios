import type { Mocked } from '../../test/setup';
import { vi, describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { NotFoundException } from '@nestjs/common';
import type {
  CreateScholarDto,
  UpdateScholarDto,
  ScholarDetailDto,
  ScholarContentUnifiedDto,
  ScholarPageFeedDto,
} from '@sd/core-contracts';
import { ScholarsRepository } from './scholars.repo';
import { ScholarsService } from './scholars.service';
import { ScholarsRecommendationService } from '../recommendation/scholars-recommendation.service';

describe('ScholarsService', () => {
  let service: ScholarsService;
  let repo: Mocked<ScholarsRepository>;
  let cacheManager: any;
  let pageFeed: ScholarsRecommendationService;

  const mockScholarDetail: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    collectionCount: number;
    totalDurationSeconds: number;
    totalContentDurationSeconds: number;
  } = {
    id: 's1',
    slug: 'ibn-uthaymeen',
    name: 'Shaykh Ibn Uthaymeen',
    bio: 'Great scholar',
    imageUrl: 'image1.jpg',
    country: 'SA',
    mainLanguage: 'ar',
    isActive: true,
    socialTwitter: '@example',
    socialTelegram: 'example',
    socialYoutube: 'example',
    socialWebsite: 'example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lectureCount: 50,
    seriesCount: 5,
    collectionCount: 2,
    totalDurationSeconds: 18000,
    totalContentDurationSeconds: 54000,
  };

  const mockScholarContent: ScholarContentUnifiedDto = {
    items: [],
  };

  beforeEach(async () => {
    cacheManager = {
      del: vi.fn().mockResolvedValue(undefined),
    };

    repo = {
      directory: vi.fn<any>(),
      hydratePageFeed: vi.fn<any>(),
      findBySlug: vi.fn<any>(),
      getContent: vi.fn<any>(),
      getFormData: vi.fn<any>(),
      create: vi.fn<any>(),
      update: vi.fn<any>(),
      findById: vi.fn<any>(),
      upsertScholarTranslation: vi.fn<any>(),
      search: vi.fn<any>(),
    } as Partial<Mocked<ScholarsRepository>> as Mocked<ScholarsRepository>;
    pageFeed = { recommend: vi.fn<any>() } as unknown as ScholarsRecommendationService;
    service = new ScholarsService(repo, pageFeed, cacheManager);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getPageFeed', () => {
    it('hydrates the recommendation selected by the page-feed service', async () => {
      const recommendation = [
        {
          form: 'scholars' as const,
          id: 'scholars:allamah' as const,
          titleKind: 'allamah' as const,
          itemIds: ['s1'],
        },
      ];
      const expected: ScholarPageFeedDto = {
        schemaVersion: 1,
        batches: [],
        nextCursor: 'next-page',
        exhausted: false,
      };
      pageFeed.recommend = vi.fn().mockResolvedValue({
        recommendations: recommendation,
        nextCursor: 'next-page',
        exhausted: false,
      });
      repo.hydratePageFeed.mockResolvedValue(expected);

      await expect(service.getPageFeed()).resolves.toEqual(expected);
      expect(pageFeed.recommend).toHaveBeenCalledTimes(1);
      expect(repo.hydratePageFeed).toHaveBeenCalledWith(recommendation);
    });
  });

  describe('directory', () => {
    it('should return the flat scholar directory from repository', async () => {
      const expected = {
        scholars: [
          {
            id: 's1',
            name: 'Test Scholar',
            slug: 'test-scholar',
            imageUrl: 'test.jpg',
            mainLanguage: 'en' as const,
            lectureCount: 10,
          },
        ],
        hasMore: false,
      };
      repo.directory.mockResolvedValue(expected);

      const result = await service.directory();

      expect(result).toEqual(expected);
      expect(repo.directory).toHaveBeenCalled();
    });
  });

  describe('getBySlug', () => {
    it('should return scholar detail when found', async () => {
      repo.findBySlug.mockResolvedValue(mockScholarDetail);

      const result = await service.getBySlug('ibn-uthaymeen');

      expect(result).toEqual(mockScholarDetail);
      expect(repo.findBySlug).toHaveBeenCalledWith('ibn-uthaymeen');
    });

    it('should throw NotFoundException when scholar not found', async () => {
      repo.findBySlug.mockResolvedValue(null);

      await expect(service.getBySlug('unknown')).rejects.toThrow(
        new NotFoundException('Scholar "unknown" not found'),
      );
    });
  });

  describe('getContent', () => {
    it('should return scholar content list', async () => {
      repo.getContent.mockResolvedValue(mockScholarContent);

      const result = await service.getContent('ibn-uthaymeen');

      expect(result).toEqual(mockScholarContent);
      expect(repo.getContent).toHaveBeenCalledWith('ibn-uthaymeen');
    });

    it('should throw NotFoundException when scholar not found', async () => {
      repo.getContent.mockResolvedValue(null);

      await expect(service.getContent('unknown')).rejects.toThrow(
        new NotFoundException('Scholar "unknown" not found'),
      );
    });
  });

  describe('create', () => {
    it('should create a new scholar', async () => {
      const dto: CreateScholarDto = {
        name: 'New Scholar',
        slug: 'new-scholar',
        bio: 'Bio details',
        imageUrl: 'new.jpg',
        isActive: true,
        country: 'SA',
        mainLanguage: 'ar',
      };
      const created = {
        id: 's2',
        ...dto,
        bio: dto.bio ?? null,
        imageUrl: dto.imageUrl ?? null,
        imageKey: null,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        country: dto.country,
        mainLanguage: dto.mainLanguage,
        title: null,
        orderIndex: 999,
        socialTwitter: null,
        socialTelegram: null,
        socialYoutube: null,
        socialWebsite: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };

      repo.create.mockResolvedValue(created as any);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(repo.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should update existing scholar', async () => {
      const dto: UpdateScholarDto = { name: 'Updated Name', title: 'sheikh' };
      const existing = {
        id: 's1',
        slug: 'test',
        name: 'Old Name',
        bio: null,
        createdAt: new Date(),
        country: 'SA',
        mainLanguage: 'ar',
        imageUrl: null,
        isActive: true,
        socialTwitter: null,
        socialTelegram: null,
        socialYoutube: null,
        socialWebsite: null,
        updatedAt: new Date(),
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };
      const updated = { ...existing, name: dto.name! };

      repo.findById.mockResolvedValue(existing as any);
      repo.update.mockResolvedValue(updated as any);

      const result = await service.update('s1', dto);

      expect(result).toEqual(updated as any);
      expect(repo.findById).toHaveBeenCalledWith('s1');
      expect(repo.update).toHaveBeenCalledWith('s1', dto);
    });

    it('should throw NotFoundException when scholar to update not found', async () => {
      const dto: UpdateScholarDto = { name: 'Updated Name' };
      repo.findById.mockResolvedValue(null);

      await expect(service.update('unknown', dto)).rejects.toThrow(
        new NotFoundException('Scholar "unknown" not found'),
      );
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
