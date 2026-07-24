import { vi, describe, it, expect, beforeEach } from 'bun:test';
import type { Mocked } from '../../test/setup';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import type { TopicDetailDto, TranslationViewDto } from '@sd/core-contracts';
import type { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';
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
            deleteTopicTranslation: vi.fn<any>(),
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

  // ─── createWithTranslations ────────────────────────────────────────────

  it('createWithTranslations creates topic and upserts translations', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue(sampleTopic);
    repo.listTopicTranslations.mockResolvedValue(sampleTranslations);

    const result = await service.createWithTranslations({
      slug: 'aqeedah',
      name: { en: 'Aqeedah' },
      translations: [{ locale: 'ar', name: 'العقيدة' }],
    });

    expect(repo.upsertBySlug).toHaveBeenCalledWith({
      slug: 'aqeedah',
      name: 'Aqeedah',
    });
    expect(repo.upsertTopicTranslation).toHaveBeenCalledWith('t1', {
      locale: 'ar',
      name: 'العقيدة',
    } satisfies SaveTopicTranslationDto);
    expect(result.translations).toHaveLength(1);
  });

  it('createWithTranslations works without translations', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue(sampleTopic);
    repo.listTopicTranslations.mockResolvedValue([]);

    const result = await service.createWithTranslations({
      slug: 'aqeedah',
      name: { en: 'Aqeedah' },
    });

    expect(repo.upsertTopicTranslation).not.toHaveBeenCalled();
    expect(result.translations).toHaveLength(0);
  });

  // ─── updateWithTranslations ────────────────────────────────────────────

  it('updateWithTranslations updates topic and upserts translations', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue(sampleTopic);
    repo.listTopicTranslations.mockResolvedValue(sampleTranslations);

    await service.updateWithTranslations('aqeedah', {
      name: { en: 'Aqeedah Updated' },
      translations: [{ locale: 'ar', name: 'العقيدة محدث' }],
    });

    expect(repo.upsertBySlug).toHaveBeenCalledWith({
      slug: 'aqeedah',
      name: 'Aqeedah Updated',
    });
    expect(repo.upsertTopicTranslation).toHaveBeenCalledWith('t1', {
      locale: 'ar',
      name: 'العقيدة محدث',
    } satisfies SaveTopicTranslationDto);
  });

  it('updateWithTranslations deletes translation when name is empty', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue({ ...sampleTopic, translations: sampleTranslations });
    repo.listTopicTranslations.mockResolvedValue([]);

    await service.updateWithTranslations('aqeedah', {
      name: { en: 'Aqeedah' },
      translations: [{ locale: 'ar', name: '' }],
    });

    expect(repo.deleteTopicTranslation).toHaveBeenCalledWith('t1', 'ar');
    expect(repo.upsertTopicTranslation).not.toHaveBeenCalled();
  });

  it('updateWithTranslations leaves locales not in array untouched', async () => {
    repo.upsertBySlug.mockResolvedValue(sampleTopic);
    repo.findBySlug.mockResolvedValue({ ...sampleTopic, translations: sampleTranslations });
    repo.listTopicTranslations.mockResolvedValue(sampleTranslations);

    await service.updateWithTranslations('aqeedah', {
      name: { en: 'Aqeedah' },
      translations: [],
    });

    expect(repo.deleteTopicTranslation).not.toHaveBeenCalled();
    expect(repo.upsertTopicTranslation).not.toHaveBeenCalled();
  });
});
