import { vi, describe, it, expect, beforeEach } from 'bun:test';
import type { Mocked } from '../../test/setup';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import type { TopicDetailDto, TranslationViewDto } from '@sd/core-contracts';
import { TopicsRepository } from './topics.repo';
import { TopicsService } from './topics.service';

describe('TopicsService', () => {
  let service: TopicsService;
  let repo: Mocked<TopicsRepository>;
  let cacheManager: any;

  const sampleTopic: TopicDetailDto = {
    id: 't1',
    slug: 'aqeedah',
    name: { en: 'Aqeedah' },
    orderIndex: 0,
    createdAt: new Date().toISOString(),
  };

  const sampleTranslations: TranslationViewDto[] = [
    {
      locale: 'ar',
      status: 'draft',
      fields: { name: 'العقيدة' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    cacheManager = {
      del: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TopicsService,
        {
          provide: TopicsRepository,
          useValue: {
            list: vi.fn<any>(),
            findBySlug: vi.fn<any>(),
            upsertBySlug: vi.fn<any>(),
            upsertTopicTranslation: vi.fn<any>(),
            listTopicTranslations: vi.fn<any>(),
          } as Partial<Mocked<TopicsRepository>>,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get(TopicsService);
    repo = module.get(TopicsRepository) as Mocked<TopicsRepository>;
  });

  // ─── Existing tests (preserved) ─────────────────────────────────────────

  it('getBySlug throws NotFoundException if missing', async () => {
    repo.findBySlug.mockResolvedValue(null);
    await expect(service.getBySlug('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ─── getAdminDetail ────────────────────────────────────────────────────

  it('getAdminDetail returns topic with translations', async () => {
    repo.findBySlug.mockResolvedValue(sampleTopic);
    repo.listTopicTranslations.mockResolvedValue(sampleTranslations);

    const result = await service.getAdminDetail('aqeedah');
    expect(result.id).toBe('t1');
    expect(result.translations).toHaveLength(1);
    expect(result.translations[0]?.locale).toBe('ar');
  });

  it('getAdminDetail throws NotFoundException if topic missing', async () => {
    repo.findBySlug.mockResolvedValue(null);
    await expect(service.getAdminDetail('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  // ─── createWithTranslations (main-language-only) ───────────────────────

  it('createWithTranslations creates topic from main-language fields only', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue(sampleTopic);
    repo.listTopicTranslations.mockResolvedValue([]);

    const result = await service.createWithTranslations({
      slug: 'aqeedah',
      name: { en: 'Aqeedah' },
    });

    expect(repo.upsertBySlug).toHaveBeenCalledWith({
      slug: 'aqeedah',
      name: 'Aqeedah',
    });
    expect(repo.upsertTopicTranslation).not.toHaveBeenCalled();
    expect(result.translations).toHaveLength(0);
  });

  // ─── updateWithTranslations (main-language-only) ───────────────────────

  it('updateWithTranslations updates only the main-language name', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue(sampleTopic);
    repo.listTopicTranslations.mockResolvedValue(sampleTranslations);

    await service.updateWithTranslations('aqeedah', {
      name: { en: 'Aqeedah Updated' },
    });

    expect(repo.upsertBySlug).toHaveBeenCalledWith({
      slug: 'aqeedah',
      name: 'Aqeedah Updated',
    });
    expect(repo.upsertTopicTranslation).not.toHaveBeenCalled();
  });
});
