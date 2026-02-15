import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsRepository } from './recommendations.repo';
import { RecommendationHeroItemDto } from './dto/recommendation-hero-item.dto';
import { RecommendationPageDto } from './dto/recommendation-page.dto';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let repo: jest.Mocked<RecommendationsRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        {
          provide: RecommendationsRepository,
          useValue: {
            listHeroItems: jest.fn(),
            listRecommendedKibar: jest.fn(),
            listRecommendedRecentPlay: jest.fn(),
            listRecommendedTopics: jest.fn(),
            listFollowingScholars: jest.fn(),
            listFollowingTopics: jest.fn(),
            listLatest: jest.fn(),
            listLatestTopics: jest.fn(),
            listPopular: jest.fn(),
            listPopularTopics: jest.fn(),
          } satisfies Partial<jest.Mocked<RecommendationsRepository>>,
        },
      ],
    }).compile();

    service = module.get(RecommendationsService);
    repo = module.get(
      RecommendationsRepository,
    ) as jest.Mocked<RecommendationsRepository>;
  });

  describe('listHero', () => {
    it('delegates to repository with default limit', async () => {
      const heroItems: RecommendationHeroItemDto[] = [
        {
          kind: 'series',
          entityId: 'ser-1',
          entitySlug: 'tawhid',
          headline: 'Tawhid First',
          title: 'Kitab at-Tawhid',
          presentedBy: 'Shaykh Abdulaziz at-Tariifi',
          presentedBySlug: 'abdulaziz-at-tarifi',
        },
      ];

      repo.listHeroItems.mockResolvedValue(heroItems);

      const result = await service.listHero();

      expect(repo.listHeroItems).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(heroItems);
    });

    it('delegates to repository with custom limit', async () => {
      const heroItems: RecommendationHeroItemDto[] = [];
      repo.listHeroItems.mockResolvedValue(heroItems);

      await service.listHero(5);

      expect(repo.listHeroItems).toHaveBeenCalledWith(5);
    });
  });

  describe('listRecommendedKibar', () => {
    it('delegates to repository with default params', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listRecommendedKibar.mockResolvedValue(page);

      const result = await service.listRecommendedKibar();

      expect(repo.listRecommendedKibar).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with custom limit and cursor', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: 'cursor-1' };
      repo.listRecommendedKibar.mockResolvedValue(page);

      const result = await service.listRecommendedKibar(10, 'cursor-1');

      expect(repo.listRecommendedKibar).toHaveBeenCalledWith(10, 'cursor-1');
      expect(result).toEqual(page);
    });
  });

  describe('listRecommendedRecentPlay', () => {
    it('delegates to repository with default params', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listRecommendedRecentPlay.mockResolvedValue(page);

      const result = await service.listRecommendedRecentPlay();

      expect(repo.listRecommendedRecentPlay).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with custom limit and cursor', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: 'cursor-2' };
      repo.listRecommendedRecentPlay.mockResolvedValue(page);

      const result = await service.listRecommendedRecentPlay(20, 'cursor-2');

      expect(repo.listRecommendedRecentPlay).toHaveBeenCalledWith(
        20,
        'cursor-2',
      );
      expect(result).toEqual(page);
    });
  });

  describe('listRecommendedTopics', () => {
    it('delegates to repository with topics CSV', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listRecommendedTopics.mockResolvedValue(page);

      const result = await service.listRecommendedTopics('aqeedah,tawhid');

      expect(repo.listRecommendedTopics).toHaveBeenCalledWith(
        'aqeedah,tawhid',
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with undefined topics', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listRecommendedTopics.mockResolvedValue(page);

      const result = await service.listRecommendedTopics(
        undefined,
        10,
        'cursor-3',
      );

      expect(repo.listRecommendedTopics).toHaveBeenCalledWith(
        undefined,
        10,
        'cursor-3',
      );
      expect(result).toEqual(page);
    });
  });

  describe('listFollowingScholars', () => {
    it('delegates to repository with default params', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listFollowingScholars.mockResolvedValue(page);

      const result = await service.listFollowingScholars();

      expect(repo.listFollowingScholars).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with custom limit and cursor', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: 'cursor-4' };
      repo.listFollowingScholars.mockResolvedValue(page);

      const result = await service.listFollowingScholars(5, 'cursor-4');

      expect(repo.listFollowingScholars).toHaveBeenCalledWith(5, 'cursor-4');
      expect(result).toEqual(page);
    });
  });

  describe('listFollowingTopics', () => {
    it('delegates to repository with topics CSV', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listFollowingTopics.mockResolvedValue(page);

      const result = await service.listFollowingTopics('fiqh,hadith');

      expect(repo.listFollowingTopics).toHaveBeenCalledWith(
        'fiqh,hadith',
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with undefined topics', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listFollowingTopics.mockResolvedValue(page);

      const result = await service.listFollowingTopics(
        undefined,
        10,
        'cursor-5',
      );

      expect(repo.listFollowingTopics).toHaveBeenCalledWith(
        undefined,
        10,
        'cursor-5',
      );
      expect(result).toEqual(page);
    });
  });

  describe('listLatest', () => {
    it('delegates to repository with default params', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listLatest.mockResolvedValue(page);

      const result = await service.listLatest();

      expect(repo.listLatest).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(page);
    });

    it('delegates with custom limit and cursor', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: 'cursor-6' };
      repo.listLatest.mockResolvedValue(page);

      const result = await service.listLatest(15, 'cursor-6');

      expect(repo.listLatest).toHaveBeenCalledWith(15, 'cursor-6');
      expect(result).toEqual(page);
    });
  });

  describe('listLatestTopics', () => {
    it('delegates to repository with topics CSV', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listLatestTopics.mockResolvedValue(page);

      const result = await service.listLatestTopics('aqeedah');

      expect(repo.listLatestTopics).toHaveBeenCalledWith(
        'aqeedah',
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with undefined topics returns empty', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listLatestTopics.mockResolvedValue(page);

      const result = await service.listLatestTopics(undefined, 10, 'cursor-7');

      expect(repo.listLatestTopics).toHaveBeenCalledWith(
        undefined,
        10,
        'cursor-7',
      );
      expect(result).toEqual(page);
    });
  });

  describe('listPopular', () => {
    it('delegates to repository with default params', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listPopular.mockResolvedValue(page);

      const result = await service.listPopular(undefined);

      expect(repo.listPopular).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with custom window days', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: 'cursor-8' };
      repo.listPopular.mockResolvedValue(page);

      const result = await service.listPopular(7, 20, 'cursor-8');

      expect(repo.listPopular).toHaveBeenCalledWith(7, 20, 'cursor-8');
      expect(result).toEqual(page);
    });
  });

  describe('listPopularTopics', () => {
    it('delegates to repository with topics and window', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: undefined };
      repo.listPopularTopics.mockResolvedValue(page);

      const result = await service.listPopularTopics('tawhid', 14);

      expect(repo.listPopularTopics).toHaveBeenCalledWith(
        'tawhid',
        14,
        undefined,
        undefined,
      );
      expect(result).toEqual(page);
    });

    it('delegates with all params', async () => {
      const page: RecommendationPageDto = { items: [], nextCursor: 'cursor-9' };
      repo.listPopularTopics.mockResolvedValue(page);

      const result = await service.listPopularTopics(
        'fiqh',
        30,
        10,
        'cursor-9',
      );

      expect(repo.listPopularTopics).toHaveBeenCalledWith(
        'fiqh',
        30,
        10,
        'cursor-9',
      );
      expect(result).toEqual(page);
    });
  });
});
