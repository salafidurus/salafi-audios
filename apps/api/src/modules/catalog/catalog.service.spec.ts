import { Test, TestingModule } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { CatalogRepository } from './catalog.repo';
import { CatalogListQueryDto } from './dto/catalog-list.query.dto';
import { CatalogPageDto } from './dto/catalog-page.dto';
import { CollectionViewDto } from '@/modules/collections/dto/collection-view.dto';
import { SeriesViewDto } from '@/modules/series/dto/series-view.dto';
import { LectureViewDto } from '@/modules/lectures/dto/lecture-view.dto';

describe('CatalogService', () => {
  let service: CatalogService;
  let repo: jest.Mocked<CatalogRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        {
          provide: CatalogRepository,
          useValue: {
            listCollections: jest.fn(),
            listRootSeries: jest.fn(),
            listRootLectures: jest.fn(),
          } satisfies Partial<jest.Mocked<CatalogRepository>>,
        },
      ],
    }).compile();

    service = module.get(CatalogService);
    repo = module.get(CatalogRepository) as jest.Mocked<CatalogRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listCollections', () => {
    it('delegates with empty query', async () => {
      const query = new CatalogListQueryDto();
      const expected: CatalogPageDto<CollectionViewDto> = {
        items: [],
        nextCursor: undefined,
      };
      repo.listCollections.mockResolvedValue(expected);

      const result = await service.listCollections(query);

      expect(repo.listCollections).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('delegates with custom query params', async () => {
      const query = new CatalogListQueryDto();
      query.limit = 10;
      query.cursor = 'cursor-123';
      query.language = 'en';
      query.scholarSlug = 'abdulaziz-at-tarifi';
      query.q = 'tawhid';
      query.topicSlug = 'aqeedah';

      const expected: CatalogPageDto<CollectionViewDto> = {
        items: [],
        nextCursor: undefined,
      };
      repo.listCollections.mockResolvedValue(expected);

      const result = await service.listCollections(query);

      expect(repo.listCollections).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('propagates errors from repository', async () => {
      const query = new CatalogListQueryDto();
      repo.listCollections.mockRejectedValue(new Error('DB connection error'));

      await expect(service.listCollections(query)).rejects.toThrow(
        'DB connection error',
      );
      expect(repo.listCollections).toHaveBeenCalledWith(query);
    });
  });

  describe('listRootSeries', () => {
    it('delegates with empty query', async () => {
      const query = new CatalogListQueryDto();
      const expected: CatalogPageDto<SeriesViewDto> = {
        items: [],
        nextCursor: undefined,
      };
      repo.listRootSeries.mockResolvedValue(expected);

      const result = await service.listRootSeries(query);

      expect(repo.listRootSeries).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('delegates with custom query params', async () => {
      const query = new CatalogListQueryDto();
      query.limit = 25;
      query.topicSlug = 'tawhid';

      const expected: CatalogPageDto<SeriesViewDto> = {
        items: [],
        nextCursor: 'next-cursor',
      };
      repo.listRootSeries.mockResolvedValue(expected);

      const result = await service.listRootSeries(query);

      expect(repo.listRootSeries).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('propagates errors from repository', async () => {
      const query = new CatalogListQueryDto();
      repo.listRootSeries.mockRejectedValue(new Error('Query failed'));

      await expect(service.listRootSeries(query)).rejects.toThrow(
        'Query failed',
      );
      expect(repo.listRootSeries).toHaveBeenCalledWith(query);
    });
  });

  describe('listRootLectures', () => {
    it('delegates with empty query', async () => {
      const query = new CatalogListQueryDto();
      const expected: CatalogPageDto<LectureViewDto> = {
        items: [],
        nextCursor: undefined,
      };
      repo.listRootLectures.mockResolvedValue(expected);

      const result = await service.listRootLectures(query);

      expect(repo.listRootLectures).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('delegates with custom query params', async () => {
      const query = new CatalogListQueryDto();
      query.limit = 5;
      query.cursor = 'cursor-456';
      query.language = 'ar';
      query.scholarSlug = 'ibn-abdulwahhab';

      const expected: CatalogPageDto<LectureViewDto> = {
        items: [],
        nextCursor: undefined,
      };
      repo.listRootLectures.mockResolvedValue(expected);

      const result = await service.listRootLectures(query);

      expect(repo.listRootLectures).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('propagates errors from repository', async () => {
      const query = new CatalogListQueryDto();
      repo.listRootLectures.mockRejectedValue(new Error('Database error'));

      await expect(service.listRootLectures(query)).rejects.toThrow(
        'Database error',
      );
      expect(repo.listRootLectures).toHaveBeenCalledWith(query);
    });
  });
});
