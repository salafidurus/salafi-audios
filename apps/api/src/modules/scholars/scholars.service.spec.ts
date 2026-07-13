import { vi, type Mocked } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type {
  ScholarDetailDto,
  ScholarContentUnifiedDto,
  ScholarListItemDto,
} from '@sd/core-contracts';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';
import { ScholarsRepository } from './scholars.repo';
import { ScholarsService } from './scholars.service';

describe('ScholarsService', () => {
  let service: ScholarsService;
  let repo: Mocked<ScholarsRepository>;

  const mockScholarDetail: ScholarDetailDto & {
    lectureCount: number;
    seriesCount: number;
    totalDurationSeconds: number;
  } = {
    id: 's1',
    slug: 'ibn-uthaymeen',
    name: 'Shaykh Ibn Uthaymeen',
    bio: 'Great scholar',
    imageUrl: 'image1.jpg',
    country: 'SA',
    mainLanguage: 'ar',
    isActive: true,
    isKibar: true,
    socialTwitter: '@example',
    socialTelegram: 'example',
    socialYoutube: 'example',
    socialWebsite: 'example.com',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lectureCount: 50,
    seriesCount: 5,
    totalDurationSeconds: 18000,
  };

  const mockScholarContent: ScholarContentUnifiedDto = {
    items: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScholarsService,
        {
          provide: ScholarsRepository,
          useValue: {
            list: vi.fn(),
            findBySlug: vi.fn(),
            getContent: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            findById: vi.fn(),
          } satisfies Partial<Mocked<ScholarsRepository>>,
        },
      ],
    }).compile();

    service = module.get(ScholarsService);
    repo = module.get(ScholarsRepository) as Mocked<ScholarsRepository>;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('should return scholars list from repository', async () => {
      const expected: { scholars: ScholarListItemDto[] } = {
        scholars: [
          {
            id: 's1',
            name: 'Test Scholar',
            slug: 'test-scholar',
            imageUrl: 'test.jpg',
            mainLanguage: 'en',
            isKibar: false,
            lectureCount: 10,
          },
        ],
      };
      repo.list.mockResolvedValue(expected);

      const result = await service.list();

      expect(result).toEqual(expected);
      expect(repo.list).toHaveBeenCalled();
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
        isKibar: false,
        isFeatured: false,
        isActive: true,
        country: 'SA',
        mainLanguage: 'ar',
      };
      const created = {
        id: 's2',
        ...dto,
        bio: dto.bio ?? null,
        imageUrl: dto.imageUrl ?? null,
        isActive: dto.isActive ?? true,
        isKibar: dto.isKibar ?? false,
        isFeatured: dto.isFeatured ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
        country: null,
        mainLanguage: null,
        socialTwitter: null,
        socialTelegram: null,
        socialYoutube: null,
        socialWebsite: null,
        ingestionBatchId: null,
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
      const dto: UpdateScholarDto = { name: 'Updated Name' };
      const existing = {
        id: 's1',
        slug: 'test',
        name: 'Old Name',
        bio: null,
        createdAt: new Date(),
        country: null,
        mainLanguage: null,
        imageUrl: null,
        isActive: true,
        isKibar: false,
        isFeatured: false,
        socialTwitter: null,
        socialTelegram: null,
        socialYoutube: null,
        socialWebsite: null,
        updatedAt: new Date(),
        ingestionBatchId: null,
        createdBy: null,
        updatedBy: null,
        deletedBy: null,
      };
      const updated = { ...existing, name: dto.name! };

      repo.findById.mockResolvedValue(existing as any);
      repo.update.mockResolvedValue(updated as any);

      const result = await service.update('s1', dto);

      expect(result).toEqual(updated);
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
